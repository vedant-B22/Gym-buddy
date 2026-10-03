import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'attendance:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Fetch attendance for specified date
    const todayLogs = await prisma.attendance.findMany({
      where: { dateString: dateStr },
      orderBy: { checkInTime: 'desc' },
      include: {
        member: {
          include: {
            user: { select: { name: true, phone: true, avatarUrl: true } },
          },
        },
      },
    });

    // Absentee list: Active members who have not checked in for 7+ days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const activeMembers = await prisma.member.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: {
        user: { select: { name: true, phone: true } },
        attendance: {
          take: 1,
          orderBy: { checkInTime: 'desc' },
        },
      },
    });

    const absentees = activeMembers
      .filter((m) => {
        if (!m.attendance.length) return true;
        return new Date(m.attendance[0].checkInTime) < sevenDaysAgo;
      })
      .map((m) => {
        const lastSeen = m.attendance[0]?.checkInTime || null;
        const daysMissed = lastSeen
          ? Math.floor((Date.now() - new Date(lastSeen).getTime()) / (1000 * 60 * 60 * 24))
          : 30;
        return {
          memberId: m.id,
          memberCode: m.memberCode,
          name: m.user.name,
          phone: m.user.phone,
          lastSeen,
          daysMissed,
        };
      })
      .sort((a, b) => b.daysMissed - a.daysMissed);

    return NextResponse.json({
      date: dateStr,
      totalCount: todayLogs.length,
      logs: todayLogs,
      absentees,
    });
  } catch (error: unknown) {
    console.error('Fetch attendance error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'attendance:write')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { memberCode, action } = body; // action: 'CHECK_IN' | 'CHECK_OUT'

    if (!memberCode) {
      return NextResponse.json({ error: 'Member code is required' }, { status: 400 });
    }

    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { memberCode: memberCode.trim().toUpperCase() },
          { id: memberCode },
          { user: { phone: memberCode.trim() } },
        ],
        deletedAt: null,
      },
      include: { user: true },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Check existing attendance for today
    const existing = await prisma.attendance.findFirst({
      where: {
        memberId: member.id,
        dateString: todayStr,
      },
      orderBy: { checkInTime: 'desc' },
    });

    if (action === 'CHECK_OUT') {
      if (!existing || existing.checkOutTime) {
        return NextResponse.json({ error: 'No active check-in found to check out' }, { status: 400 });
      }

      await prisma.attendance.update({
        where: { id: existing.id },
        data: { checkOutTime: now },
      });

      return NextResponse.json({
        success: true,
        message: `Checked out ${member.user.name} at ${now.toLocaleTimeString()}`,
      });
    }

    // CHECK_IN action
    if (existing && !existing.checkOutTime) {
      return NextResponse.json(
        { message: `${member.user.name} is already checked in today!`, alreadyCheckedIn: true },
        { status: 200 }
      );
    }

    const newAttendance = await prisma.attendance.create({
      data: {
        memberId: member.id,
        checkInTime: now,
        checkInMethod: 'MANUAL_STAFF',
        verifiedByUserId: session.userId,
        dateString: todayStr,
      },
    });

    // Update member's streak and last workout date
    await prisma.member.update({
      where: { id: member.id },
      data: {
        streakCurrent: { increment: 1 },
        lastWorkoutDate: now,
      },
    });

    return NextResponse.json({
      success: true,
      attendance: newAttendance,
      member: {
        name: member.user.name,
        code: member.memberCode,
        status: member.status,
      },
    });
  } catch (error: unknown) {
    console.error('Record attendance error:', error);
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
  }
}
