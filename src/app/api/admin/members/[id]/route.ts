import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { calculateUnfreeze, deriveMemberStatus } from '@/lib/business-logic';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'members:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
        memberships: {
          orderBy: { createdAt: 'desc' },
          include: { plan: true },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          include: { recordedBy: { select: { name: true } }, invoices: true },
        },
        attendance: {
          orderBy: { checkInTime: 'desc' },
          take: 30,
        },
        workouts: {
          orderBy: { createdAt: 'desc' },
          take: 15,
          include: {
            sets: { include: { exercise: { select: { name: true, muscleGroup: true } } } },
          },
        },
        personalRecords: {
          orderBy: { achievedAt: 'desc' },
          include: { exercise: { select: { name: true } } },
        },
        bodyMetrics: {
          orderBy: { date: 'desc' },
          take: 12,
        },
        planAssignments: {
          where: { isActive: true },
          include: { plan: { include: { days: true } }, assignedBy: { select: { name: true } } },
        },
        dietPlans: {
          where: { isActive: true },
          include: { assignedBy: { select: { name: true } } },
        },
        badges: {
          include: { badge: true },
        },
      },
    });

    if (!member || member.deletedAt) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const computedStatus = deriveMemberStatus(member.currentExpiryDate, member.frozenAt);

    return NextResponse.json({
      member: {
        ...member,
        status: member.status !== 'FROZEN' ? computedStatus : member.status,
      },
    });
  } catch (error: unknown) {
    console.error('Fetch member details error:', error);
    return NextResponse.json({ error: 'Failed to fetch member details' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'members:write')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { action } = body;

    const member = await prisma.member.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Action: FREEZE MEMBERSHIP
    if (action === 'FREEZE') {
      if (member.frozenAt) {
        return NextResponse.json({ error: 'Membership is already frozen' }, { status: 400 });
      }

      await prisma.member.update({
        where: { id },
        data: {
          status: 'FROZEN',
          frozenAt: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'FREEZE_MEMBERSHIP',
          entityType: 'Member',
          entityId: member.id,
          detailsJson: JSON.stringify({ reason: body.reason || 'Requested by member' }),
        },
      });

      return NextResponse.json({ success: true, message: 'Membership frozen successfully' });
    }

    // Action: UNFREEZE MEMBERSHIP
    if (action === 'UNFREEZE') {
      if (!member.frozenAt || !member.currentExpiryDate) {
        return NextResponse.json({ error: 'Membership is not frozen' }, { status: 400 });
      }

      const { newExpiryDate, daysFrozen } = calculateUnfreeze(member.currentExpiryDate, member.frozenAt);
      const newStatus = deriveMemberStatus(newExpiryDate, null);

      await prisma.member.update({
        where: { id },
        data: {
          status: newStatus,
          frozenAt: null,
          currentExpiryDate: newExpiryDate,
          freezeDaysTotal: member.freezeDaysTotal + daysFrozen,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'UNFREEZE_MEMBERSHIP',
          entityType: 'Member',
          entityId: member.id,
          detailsJson: JSON.stringify({ daysFrozen, newExpiryDate }),
        },
      });

      return NextResponse.json({ success: true, message: `Membership resumed! Extended by ${daysFrozen} days.` });
    }

    // Action: EXTEND MEMBERSHIP DURATION
    if (action === 'EXTEND') {
      const days = parseInt(body.days, 10);
      if (!days || days <= 0) {
        return NextResponse.json({ error: 'Please enter valid days to extend' }, { status: 400 });
      }

      const baseDate = member.currentExpiryDate && member.currentExpiryDate > new Date()
        ? new Date(member.currentExpiryDate)
        : new Date();

      const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
      const newStatus = deriveMemberStatus(newExpiry, null);

      await prisma.member.update({
        where: { id },
        data: {
          currentExpiryDate: newExpiry,
          status: newStatus,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'EXTEND_MEMBERSHIP',
          entityType: 'Member',
          entityId: member.id,
          detailsJson: JSON.stringify({ days, reason: body.reason }),
        },
      });

      return NextResponse.json({ success: true, message: `Membership extended by ${days} days.` });
    }

    // Action: RESET PASSWORD
    if (action === 'RESET_PASSWORD') {
      const newPass = body.password || 'password123';
      const hash = await bcrypt.hash(newPass, 10);
      await prisma.user.update({
        where: { id: member.userId },
        data: { passwordHash: hash },
      });

      return NextResponse.json({ success: true, message: `Password reset to: ${newPass}` });
    }

    // Default: UPDATE PROFILE
    const { name, phone, email, dob, gender, heightCm, weightKg, fitnessGoal, emergencyName, emergencyPhone, healthNotes } = body;

    if (name || phone || email) {
      await prisma.user.update({
        where: { id: member.userId },
        data: {
          ...(name && { name }),
          ...(phone && { phone: phone.trim().replace(/\D/g, '') }),
          ...(email && { email: email.trim().toLowerCase() }),
        },
      });
    }

    const updated = await prisma.member.update({
      where: { id },
      data: {
        ...(dob !== undefined && { dob }),
        ...(gender !== undefined && { gender }),
        ...(heightCm !== undefined && { heightCm: heightCm ? parseFloat(heightCm) : null }),
        ...(weightKg !== undefined && { weightKg: weightKg ? parseFloat(weightKg) : null }),
        ...(fitnessGoal !== undefined && { fitnessGoal }),
        ...(emergencyName !== undefined && { emergencyName }),
        ...(emergencyPhone !== undefined && { emergencyPhone }),
        ...(healthNotes !== undefined && { healthNotes }),
      },
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error: unknown) {
    console.error('Update member error:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'members:delete')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    await prisma.member.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'SOFT_DELETE_MEMBER',
        entityType: 'Member',
        entityId: id,
      },
    });

    return NextResponse.json({ success: true, message: 'Member archived successfully' });
  } catch (error: unknown) {
    console.error('Delete member error:', error);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
