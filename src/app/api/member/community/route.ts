import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    let member = await prisma.member.findFirst({
      where: session?.memberId ? { id: session.memberId } : { userId: session?.userId },
    });
    if (!member) member = await prisma.member.findFirst({ where: { memberCode: 'IF-1001' } });

    // 1. Leaderboards (only opt-in members)
    const [streakRankings, membersWithWorkouts, challenges, badges, memberBadges] = await Promise.all([
      prisma.member.findMany({
        where: { optInLeaderboard: true, deletedAt: null },
        orderBy: { streakCurrent: 'desc' },
        take: 10,
        include: { user: { select: { name: true, avatarUrl: true } } },
      }),
      prisma.member.findMany({
        where: { optInLeaderboard: true, deletedAt: null },
        take: 10,
        include: {
          user: { select: { name: true, avatarUrl: true } },
          workouts: { select: { totalVolumeKg: true, isCompleted: true } },
        },
      }),
      prisma.challenge.findMany({
        where: { isActive: true },
        include: {
          participants: {
            where: member ? { memberId: member.id } : undefined,
          },
        },
      }),
      prisma.badge.findMany({ orderBy: { threshold: 'asc' } }),
      member
        ? prisma.memberBadge.findMany({
            where: { memberId: member.id },
            include: { badge: true },
          })
        : [],
    ]);

    // Format volume leaderboard
    const volumeRankings = membersWithWorkouts
      .map((m) => {
        const totalVol = m.workouts.reduce((acc, w) => acc + (w.totalVolumeKg || 0), 0);
        return {
          id: m.id,
          name: m.user.name,
          memberCode: m.memberCode,
          workoutsCount: m.workouts.length,
          totalVolumeKg: totalVol,
        };
      })
      .sort((a, b) => b.totalVolumeKg - a.totalVolumeKg);

    const unlockedBadgeIds = new Set(memberBadges.map((mb) => mb.badgeId));

    return NextResponse.json({
      leaderboard: {
        streaks: streakRankings.map((s, idx) => ({
          rank: idx + 1,
          name: s.user.name,
          streak: s.streakCurrent,
          isMe: member?.id === s.id,
        })),
        volume: volumeRankings.map((v, idx) => ({
          rank: idx + 1,
          name: v.name,
          workouts: v.workoutsCount,
          volume: v.totalVolumeKg,
          isMe: member?.id === v.id,
        })),
      },
      challenges: challenges.map((c) => {
        const participant = c.participants[0];
        return {
          ...c,
          myProgress: participant ? participant.currentProgress : 0,
          isJoined: !!participant,
          isCompleted: participant ? participant.isCompleted : false,
        };
      }),
      badges: badges.map((b) => ({
        ...b,
        unlocked: unlockedBadgeIds.has(b.id),
      })),
      optInLeaderboard: member?.optInLeaderboard ?? true,
    });
  } catch (error: unknown) {
    console.error('Fetch community error:', error);
    return NextResponse.json({ error: 'Failed to fetch community data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    let member = await prisma.member.findFirst({
      where: session?.memberId ? { id: session.memberId } : { userId: session?.userId },
    });
    if (!member) member = await prisma.member.findFirst({ where: { memberCode: 'IF-1001' } });
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    const body = await req.json();
    const { action, challengeId, optIn } = body;

    if (action === 'TOGGLE_OPT_IN') {
      await prisma.member.update({
        where: { id: member.id },
        data: { optInLeaderboard: !!optIn },
      });
      return NextResponse.json({ success: true, optInLeaderboard: !!optIn });
    }

    if (action === 'JOIN_CHALLENGE' && challengeId) {
      await prisma.challengeParticipant.upsert({
        where: {
          challengeId_memberId: {
            challengeId,
            memberId: member.id,
          },
        },
        create: {
          challengeId,
          memberId: member.id,
          currentProgress: 0,
        },
        update: {},
      });
      return NextResponse.json({ success: true, message: 'Joined challenge!' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Community action error:', error);
    return NextResponse.json({ error: 'Failed to perform community action' }, { status: 500 });
  }
}
