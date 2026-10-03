import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { calculateMembershipDates } from '@/lib/business-logic';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'payments:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const mode = searchParams.get('mode');
    const memberId = searchParams.get('memberId');

    const where: any = {};
    if (mode && mode !== 'ALL') where.paymentMode = mode;
    if (memberId) where.memberId = memberId;

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { invoiceNumber: { contains: q } },
        { referenceId: { contains: q } },
        { member: { memberCode: { contains: q } } },
        { member: { user: { name: { contains: q } } } },
        { member: { user: { phone: { contains: q } } } },
      ];
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { paymentDate: 'desc' },
      include: {
        member: {
          include: {
            user: { select: { name: true, phone: true, email: true } },
          },
        },
        membership: {
          include: { plan: true },
        },
        recordedBy: {
          select: { name: true },
        },
        invoices: true,
      },
    });

    return NextResponse.json({ payments });
  } catch (error: unknown) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'payments:write')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const {
      memberId,
      planId,
      amount,
      discount = 0,
      paymentMode,
      referenceId,
      notes,
      paymentDate = new Date().toISOString(),
    } = body;

    if (!memberId || amount === undefined || !paymentMode) {
      return NextResponse.json({ error: 'Member, amount, and payment mode are required' }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    let membershipId: string | null = null;
    let newExpiryDate = member.currentExpiryDate;

    // If plan renewal selected, calculate new start and end dates
    let plan = null;
    if (planId) {
      plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
      if (plan) {
        const dateResult = calculateMembershipDates(
          member.currentExpiryDate,
          new Date(paymentDate),
          plan.durationDays
        );

        const totalCost = plan.price + plan.joiningFee;
        const discountVal = parseFloat(discount) || 0;
        const finalCost = Math.max(0, totalCost - discountVal);
        const amountPaid = parseFloat(amount) || 0;
        const dues = Math.max(0, finalCost - amountPaid);

        const membership = await prisma.membership.create({
          data: {
            memberId: member.id,
            planId: plan.id,
            startDate: dateResult.startDate,
            endDate: dateResult.endDate,
            price: totalCost,
            discountAmount: discountVal,
            finalAmount: finalCost,
            status: 'ACTIVE',
            notes: notes || `Manual payment recorded by ${session.name}`,
          },
        });

        membershipId = membership.id;
        newExpiryDate = dateResult.endDate;

        // Update member's current status and expiry
        await prisma.member.update({
          where: { id: member.id },
          data: {
            currentPlanId: plan.id,
            currentExpiryDate: dateResult.endDate,
            status: 'ACTIVE',
            frozenAt: null, // Clear any previous freeze on renewal
          },
        });
      }
    }

    // Generate unique invoice number
    const paymentCount = await prisma.payment.count();
    const invoiceNumber = `INV-2026-${(1000 + paymentCount + 1).toString()}`;
    const amountVal = parseFloat(amount) || 0;
    const discountVal = parseFloat(discount) || 0;

    const payment = await prisma.payment.create({
      data: {
        invoiceNumber,
        memberId: member.id,
        membershipId,
        amount: amountVal,
        discount: discountVal,
        paymentMode,
        referenceId: referenceId || null,
        paymentDate: new Date(paymentDate),
        notes: notes || (plan ? `Payment for ${plan.name}` : 'General payment/dues clear'),
        duesRemaining: 0,
        recordedByUserId: session.userId,
      },
    });

    // Create Invoice record
    const invoice = await prisma.invoice.create({
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
          name: member.user.name,
          phone: member.user.phone,
          memberCode: member.memberCode,
        }),
        itemsJson: JSON.stringify([
          {
            description: plan ? `${plan.name} (${plan.durationMonths} Month)` : 'Gym Membership / Fees',
            amount: amountVal + discountVal,
          },
          ...(discountVal > 0 ? [{ description: 'Discount Applied', amount: -discountVal }] : []),
        ]),
        subtotal: amountVal + discountVal,
        taxAmount: Math.round(amountVal * 0.18),
        totalAmount: amountVal,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'RECORD_PAYMENT',
        entityType: 'Payment',
        entityId: payment.id,
        detailsJson: JSON.stringify({
          invoiceNumber,
          amount: amountVal,
          paymentMode,
          memberCode: member.memberCode,
          newExpiryDate,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      payment,
      invoice,
      invoiceNumber,
      newExpiryDate,
    });
  } catch (error: unknown) {
    console.error('Record payment error:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
