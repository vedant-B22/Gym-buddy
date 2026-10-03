import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { deriveMemberStatus } from '@/lib/business-logic';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let member = await prisma.member.findFirst({
      where: session.memberId ? { id: session.memberId } : { userId: session.userId },
      include: {
        user: { select: { name: true, phone: true, email: true } },
        memberships: {
          orderBy: { createdAt: 'desc' },
          include: { plan: true },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          include: { invoices: true },
        },
      },
    });

    if (!member) member = await prisma.member.findFirst({
      where: { memberCode: 'IF-1001' },
      include: {
        user: { select: { name: true, phone: true, email: true } },
        memberships: {
          orderBy: { createdAt: 'desc' },
          include: { plan: true },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          include: { invoices: true },
        },
      },
    });

    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    const liveStatus = deriveMemberStatus(member.currentExpiryDate, member.frozenAt);

    return NextResponse.json({
      member: {
        ...member,
        status: member.status !== 'FROZEN' ? liveStatus : member.status,
      },
    });
  } catch (error: unknown) {
    console.error('Fetch membership error:', error);
    return NextResponse.json({ error: 'Failed to fetch membership' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let member = await prisma.member.findFirst({
      where: session.memberId ? { id: session.memberId } : { userId: session.userId },
      include: { user: true },
    });
    if (!member) member = await prisma.member.findFirst({ where: { memberCode: 'IF-1001' }, include: { user: true } });
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    const body = await req.json();
    const { preferredPlanName, message } = body;

    // Create notification for all staff (Owner, Manager, Receptionist)
    const staffUsers = await prisma.user.findMany({
      where: { role: { in: ['OWNER', 'MANAGER', 'RECEPTIONIST'] } },
    });

    for (const staff of staffUsers) {
      await prisma.notification.create({
        data: {
          userId: staff.id,
          title: `Renewal Request from ${member.user.name}`,
          message: `${member.user.name} (${member.memberCode}, Ph: ${member.user.phone}) requested a membership renewal for ${preferredPlanName || 'their plan'}. ${message ? `Note: "${message}"` : ''}`,
          type: 'MEMBERSHIP_EXPIRY',
          linkUrl: `/admin/members/${member.id}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Renewal request sent! The front desk will follow up or you can pay at the counter.',
    });
  } catch (error: unknown) {
    console.error('Renewal request error:', error);
    return NextResponse.json({ error: 'Failed to submit renewal request' }, { status: 500 });
  }
}
