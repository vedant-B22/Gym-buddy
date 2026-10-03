import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const { searchParams } = new URL(req.url);
    const day = searchParams.get('day'); // Monday, Tuesday, etc.

    const where: any = { isActive: true };
    if (day && day !== 'ALL') where.dayOfWeek = day;

    const classes = await prisma.gymClass.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        trainer: { select: { id: true, name: true, avatarUrl: true } },
        bookings: {
          select: { id: true, memberId: true, bookingDate: true, status: true },
        },
      },
    });

    let currentMemberId = session?.memberId;
    if (!currentMemberId && session?.userId) {
      const m = await prisma.member.findUnique({ where: { userId: session.userId } });
      currentMemberId = m?.id;
    }
    if (!currentMemberId) {
      const demoM = await prisma.member.findFirst({ where: { memberCode: 'IF-1001' } });
      currentMemberId = demoM?.id;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const formatted = classes.map((c) => {
      const activeBookings = c.bookings.filter((b) => b.status === 'BOOKED');
      const isBookedByMe = activeBookings.some((b) => b.memberId === currentMemberId);
      const spotsLeft = Math.max(0, c.capacity - activeBookings.length);

      return {
        ...c,
        bookedCount: activeBookings.length,
        spotsLeft,
        isFull: spotsLeft === 0,
        isBookedByMe,
      };
    });

    return NextResponse.json({ classes: formatted, currentMemberId });
  } catch (error: unknown) {
    console.error('Fetch classes error:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, classId, date = new Date().toISOString().split('T')[0] } = body;

    // Action 1: Member Books or Cancels a class slot
    if (action === 'BOOK_SLOT' || action === 'CANCEL_SLOT') {
      let memberId = session.memberId;
      if (!memberId) {
        const m = await prisma.member.findFirst({ where: { userId: session.userId } });
        memberId = m?.id;
      }
      if (!memberId) {
        const demoM = await prisma.member.findFirst({ where: { memberCode: 'IF-1001' } });
        memberId = demoM?.id;
      }

      if (!memberId || !classId) {
        return NextResponse.json({ error: 'Member and class ID required' }, { status: 400 });
      }

      if (action === 'CANCEL_SLOT') {
        await prisma.classBooking.deleteMany({
          where: { classId, memberId },
        });
        return NextResponse.json({ success: true, message: 'Class booking cancelled' });
      }

      // Check capacity
      const gymClass = await prisma.gymClass.findUnique({
        where: { id: classId },
        include: { bookings: { where: { status: 'BOOKED' } } },
      });

      if (!gymClass) return NextResponse.json({ error: 'Class not found' }, { status: 404 });
      if (gymClass.bookings.length >= gymClass.capacity) {
        return NextResponse.json({ error: 'Class is full' }, { status: 400 });
      }

      await prisma.classBooking.upsert({
        where: {
          classId_memberId_bookingDate: {
            classId,
            memberId,
            bookingDate: date,
          },
        },
        create: {
          classId,
          memberId,
          bookingDate: date,
          status: 'BOOKED',
        },
        update: {
          status: 'BOOKED',
        },
      });

      return NextResponse.json({ success: true, message: `Spot confirmed in ${gymClass.name}!` });
    }

    // Action 2: Staff Creates a new class
    if (hasPermission(session.role, 'classes:write')) {
      const { name, description, trainerId, dayOfWeek, startTime, endTime, capacity = 20, room, color = '#10B981' } = body;

      const created = await prisma.gymClass.create({
        data: {
          name,
          description: description || 'Group fitness class',
          trainerId,
          dayOfWeek,
          startTime,
          endTime,
          capacity: parseInt(capacity, 10),
          room: room || 'Main Studio',
          color,
          isActive: true,
        },
      });

      return NextResponse.json({ success: true, class: created });
    }

    return NextResponse.json({ error: 'Unauthorized operation' }, { status: 403 });
  } catch (error: unknown) {
    console.error('Class action error:', error);
    return NextResponse.json({ error: 'Failed to process class action' }, { status: 500 });
  }
}
