import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deriveMemberStatus } from '@/lib/business-logic';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const members = await prisma.member.findMany({
      where: { deletedAt: null },
      include: { user: true },
    });

    let updatedCount = 0;
    const notificationsCreated = [];

    for (const m of members) {
      const derived = deriveMemberStatus(m.currentExpiryDate, m.frozenAt);

      if (derived !== m.status) {
        await prisma.member.update({
          where: { id: m.id },
          data: { status: derived },
        });
        updatedCount++;
      }

      // Check for expiry alert thresholds (7 days, 3 days, 1 day, Expired today)
      if (m.currentExpiryDate && !m.frozenAt) {
        const diffDays = Math.ceil((new Date(m.currentExpiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 7 || diffDays === 3 || diffDays === 1) {
          await prisma.notification.create({
            data: {
              userId: m.userId,
              title: `Membership Expiring in ${diffDays} Days`,
              message: `Your Iron Forge gym membership expires on ${m.currentExpiryDate.toLocaleDateString('en-IN')}. Renew today at reception to avoid any pause in your training.`,
              type: 'MEMBERSHIP_EXPIRY',
              linkUrl: '/app/membership',
            },
          });
          notificationsCreated.push({ member: m.user.name, diffDays });
        } else if (diffDays <= 0 && m.status !== 'EXPIRED') {
          await prisma.notification.create({
            data: {
              userId: m.userId,
              title: 'Your Gym Membership has Expired',
              message: 'Your pass expired today. Visit the reception desk to renew your membership and keep crushing your goals.',
              type: 'MEMBERSHIP_EXPIRY',
              linkUrl: '/app/membership',
            },
          });
        }
      }

      // Check streak reset (missed > 3 consecutive days)
      if (m.lastWorkoutDate && m.streakCurrent > 0) {
        const daysSinceLastWorkout = Math.floor((now.getTime() - new Date(m.lastWorkoutDate).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastWorkout > 3) {
          await prisma.member.update({
            where: { id: m.id },
            data: { streakCurrent: 0 },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      scannedMembers: members.length,
      statusUpdatedCount: updatedCount,
      notificationsSent: notificationsCreated.length,
      timestamp: now.toISOString(),
    });
  } catch (error: unknown) {
    console.error('Expiry recomputation error:', error);
    return NextResponse.json({ error: 'Failed to recompute expiry' }, { status: 500 });
  }
}
