import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { deriveMemberStatus } from '@/lib/business-logic';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find member by userId or memberId
    let member = await prisma.member.findFirst({
      where: session.memberId ? { id: session.memberId } : { userId: session.userId },
      include: {
        user: { select: { name: true, phone: true, email: true, avatarUrl: true } },
        memberships: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { plan: true },
        },
        planAssignments: {
          where: { isActive: true },
          take: 1,
          include: { plan: { include: { days: true } } },
        },
        dietPlans: {
          where: { isActive: true },
          take: 1,
        },
        classBookings: {
          where: {
            bookingDate: { gte: new Date().toISOString().split('T')[0] },
            status: 'BOOKED',
          },
          take: 1,
          include: { gymClass: { include: { trainer: { select: { name: true } } } } },
        },
      },
    });

    // If demo staff logged in without member profile, fallback to Arjun Mehta (IF-1001)
    if (!member) {
      member = await prisma.member.findFirst({
        where: { memberCode: 'IF-1001' },
        include: {
          user: { select: { name: true, phone: true, email: true, avatarUrl: true } },
          memberships: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: { plan: true },
          },
          planAssignments: {
            where: { isActive: true },
            take: 1,
            include: { plan: { include: { days: true } } },
          },
          dietPlans: {
            where: { isActive: true },
            take: 1,
          },
          classBookings: {
            where: { status: 'BOOKED' },
            take: 1,
            include: { gymClass: { include: { trainer: { select: { name: true } } } } },
          },
        },
      });
    }

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const now = new Date();
    const liveStatus = deriveMemberStatus(member.currentExpiryDate, member.frozenAt);

    // Calculate days remaining
    let daysRemaining = 0;
    if (member.currentExpiryDate) {
      daysRemaining = Math.max(
        0,
        Math.ceil((new Date(member.currentExpiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
    }

    // Get this week's attendance (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    const recentAttendance = await prisma.attendance.findMany({
      where: {
        memberId: member.id,
        checkInTime: { gte: sevenDaysAgo },
      },
      select: { dateString: true },
    });

    const attendedDates = new Set(recentAttendance.map((a) => a.dateString));

    // Generate Mon-Sun or past 7 days flags
    const weekDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const ds = d.toISOString().split('T')[0];
      const dayLetter = d.toLocaleDateString('en-US', { weekday: 'narrow' });
      weekDays.push({
        date: ds,
        day: dayLetter,
        attended: attendedDates.has(ds),
        isToday: i === 0,
      });
    }

    // Live Crowd Info
    const todayStr = now.toISOString().split('T')[0];
    const ninetyMinsAgo = new Date(now.getTime() - 90 * 60 * 1000);
    const currentCrowd = await prisma.attendance.count({
      where: {
        dateString: todayStr,
        checkInTime: { gte: ninetyMinsAgo },
        checkOutTime: null,
      },
    });

    // Check if member checked in today
    const checkedInToday = await prisma.attendance.findFirst({
      where: {
        memberId: member.id,
        dateString: todayStr,
      },
    });

    // Last completed workout
    const lastWorkout = await prisma.workout.findFirst({
      where: { memberId: member.id },
      orderBy: { createdAt: 'desc' },
      select: { name: true, durationSeconds: true, totalVolumeKg: true, createdAt: true },
    });

    return NextResponse.json({
      member: {
        id: member.id,
        name: member.user.name,
        code: member.memberCode,
        avatarUrl: member.user.avatarUrl,
        streakCurrent: member.streakCurrent,
        streakLongest: member.streakLongest,
        status: liveStatus,
        daysRemaining,
        currentExpiryDate: member.currentExpiryDate,
        planName: member.memberships?.[0]?.plan?.name || 'Standard Pass',
        qrSecret: member.qrSecret,
      },
      weekAttendance: weekDays,
      checkedInToday: !!checkedInToday,
      crowd: {
        count: currentCrowd,
        capacity: 80,
        rushLevel: currentCrowd > 60 ? 'High' : currentCrowd > 35 ? 'Moderate' : 'Low',
      },
      todayWorkout: member.planAssignments?.[0]?.plan?.days?.[0] || null,
      assignedPlan: member.planAssignments?.[0]?.plan || null,
      nextClass: member.classBookings?.[0]?.gymClass || null,
      lastWorkout,
    });
  } catch (error: unknown) {
    console.error('Member dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch member dashboard' }, { status: 500 });
  }
}
