import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { validateRotatingQrToken } from '@/lib/business-logic';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let member = await prisma.member.findFirst({
      where: session.memberId ? { id: session.memberId } : { userId: session.userId },
    });
    if (!member) member = await prisma.member.findFirst({ where: { memberCode: 'IF-1001' } });
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    const attendance = await prisma.attendance.findMany({
      where: { memberId: member.id },
      orderBy: { checkInTime: 'desc' },
      take: 60,
    });

    return NextResponse.json({
      attendance,
      streakCurrent: member.streakCurrent,
      streakLongest: member.streakLongest,
      totalVisits: attendance.length,
    });
  } catch (error: unknown) {
    console.error('Fetch member attendance error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let member = await prisma.member.findFirst({
      where: session.memberId ? { id: session.memberId } : { userId: session.userId },
    });
    if (!member) member = await prisma.member.findFirst({ where: { memberCode: 'IF-1001' } });
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'No QR token provided' }, { status: 400 });
    }

    // Validate rotating token
    const isValid = validateRotatingQrToken(token);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired QR code. Please scan the current live QR on the reception tablet.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Check if already checked in today
    const existing = await prisma.attendance.findFirst({
      where: {
        memberId: member.id,
        dateString: todayStr,
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        message: 'You are already checked in for today!',
        attendance: existing,
      });
    }

    const newAttendance = await prisma.attendance.create({
      data: {
        memberId: member.id,
        checkInTime: now,
        checkInMethod: 'QR_SCAN',
        dateString: todayStr,
      },
    });

    // Update streak and last workout date
    await prisma.member.update({
      where: { id: member.id },
      data: {
        streakCurrent: { increment: 1 },
        lastWorkoutDate: now,
      },
    });

    return NextResponse.json({
      success: true,
      message: '✓ Entry Verified! Welcome to Iron Forge.',
      checkInTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attendance: newAttendance,
    });
  } catch (error: unknown) {
    console.error('Member check-in error:', error);
    return NextResponse.json({ error: 'Check-in failed' }, { status: 500 });
  }
}
