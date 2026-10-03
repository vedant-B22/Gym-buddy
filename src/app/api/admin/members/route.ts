import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { calculateMembershipDates, deriveMemberStatus } from '@/lib/business-logic';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'members:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const planId = searchParams.get('planId');

    const where: any = {
      deletedAt: null,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (planId && planId !== 'ALL') {
      where.currentPlanId = planId;
    }

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { memberCode: { contains: q } },
        { user: { name: { contains: q } } },
        { user: { phone: { contains: q } } },
        { user: { email: { contains: q } } },
      ];
    }

    const members = await prisma.member.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        memberships: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { plan: true },
        },
        payments: {
          take: 1,
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    // Re-verify real-time status in case expiry date passed
    const updatedMembers = members.map((m) => {
      const liveStatus = deriveMemberStatus(m.currentExpiryDate, m.frozenAt);
      return {
        ...m,
        status: m.status !== 'FROZEN' ? liveStatus : m.status,
      };
    });

    return NextResponse.json({ members: updatedMembers });
  } catch (error: unknown) {
    console.error('Fetch members error:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'members:write')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      phone,
      email,
      gender,
      dob,
      heightCm,
      weightKg,
      fitnessGoal,
      emergencyName,
      emergencyPhone,
      healthNotes,
      planId,
      paymentMode,
      amountPaid,
      discountAmount = 0,
      referenceId,
    } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone number are required' }, { status: 400 });
    }

    // Check duplicate phone or email
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const cleanEmail = email ? email.trim().toLowerCase() : `${cleanPhone}@ironforge.internal`;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone: cleanPhone }, { email: cleanEmail }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'A member with this phone or email already exists' }, { status: 400 });
    }

    // Generate unique member code & referral code
    const memberCount = await prisma.member.count();
    const memberCode = `IF-${1001 + memberCount}`;
    const referralCode = `FORGE${Math.floor(1000 + Math.random() * 9000)}`;

    const passwordHash = await bcrypt.hash('password123', 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone: cleanPhone,
        email: cleanEmail,
        passwordHash,
        role: 'MEMBER',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      },
    });

    let currentExpiryDate: Date | null = null;
    let selectedPlan: any = null;

    if (planId) {
      selectedPlan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
      if (selectedPlan) {
        const dateResult = calculateMembershipDates(null, new Date(), selectedPlan.durationDays);
        currentExpiryDate = dateResult.endDate;
      }
    }

    const member = await prisma.member.create({
      data: {
        userId: user.id,
        memberCode,
        dob,
        gender,
        heightCm: heightCm ? parseFloat(heightCm) : null,
        weightKg: weightKg ? parseFloat(weightKg) : null,
        fitnessGoal,
        emergencyName,
        emergencyPhone,
        healthNotes,
        referralCode,
        currentPlanId: planId || null,
        currentExpiryDate,
        status: currentExpiryDate ? 'ACTIVE' : 'INACTIVE',
      },
    });

    // If initial plan selected, create Membership and Payment record
    if (selectedPlan && amountPaid !== undefined) {
      const finalAmount = Math.max(0, (selectedPlan.price + selectedPlan.joiningFee) - discountAmount);
      const paid = parseFloat(amountPaid) || 0;
      const dues = Math.max(0, finalAmount - paid);

      const membership = await prisma.membership.create({
        data: {
          memberId: member.id,
          planId: selectedPlan.id,
          startDate: new Date(),
          endDate: currentExpiryDate!,
          price: selectedPlan.price + selectedPlan.joiningFee,
          discountAmount: parseFloat(discountAmount) || 0,
          finalAmount,
          status: 'ACTIVE',
        },
      });

      const invCount = await prisma.payment.count();
      const invoiceNumber = `INV-2026-${(1000 + invCount + 1).toString()}`;

      const payment = await prisma.payment.create({
        data: {
          invoiceNumber,
          memberId: member.id,
          membershipId: membership.id,
          amount: paid,
          discount: parseFloat(discountAmount) || 0,
          paymentMode: paymentMode || 'CASH',
          referenceId,
          paymentDate: new Date(),
          duesRemaining: dues,
          recordedByUserId: session.userId,
          notes: `Initial membership enrollment - ${selectedPlan.name}`,
        },
      });

      await prisma.invoice.create({
        data: {
          invoiceNumber,
          paymentId: payment.id,
          memberId: member.id,
          gymDetailsJson: JSON.stringify({
            name: 'IRON FORGE FITNESS',
            gstin: '29ABCDE1234F1Z5',
            address: '42, 100 Feet Road, Indiranagar, Bengaluru 560038',
            phone: '+91 98765 43210',
            email: 'contact@ironforgegym.in',
          }),
          memberDetailsJson: JSON.stringify({
            name,
            phone: cleanPhone,
            memberCode,
          }),
          itemsJson: JSON.stringify([
            { description: `${selectedPlan.name} (${selectedPlan.durationMonths} Month)`, amount: selectedPlan.price },
            ...(selectedPlan.joiningFee > 0 ? [{ description: 'Joining / Registration Fee', amount: selectedPlan.joiningFee }] : []),
            ...(discountAmount > 0 ? [{ description: 'Discount Applied', amount: -discountAmount }] : []),
          ]),
          subtotal: selectedPlan.price + selectedPlan.joiningFee,
          taxAmount: Math.round(finalAmount * 0.18),
          totalAmount: finalAmount,
        },
      });
    }

    // Award welcome badge
    const firstBadge = await prisma.badge.findFirst({ where: { code: 'FIRST_WORKOUT' } });
    if (firstBadge) {
      await prisma.memberBadge.create({
        data: {
          memberId: member.id,
          badgeId: firstBadge.id,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'CREATE_MEMBER',
        entityType: 'Member',
        entityId: member.id,
        detailsJson: JSON.stringify({ name, phone: cleanPhone, memberCode, planId }),
      },
    });

    return NextResponse.json({ success: true, member, memberCode });
  } catch (error: unknown) {
    console.error('Create member error:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
