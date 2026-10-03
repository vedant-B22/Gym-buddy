import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'members:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const plans = await prisma.membershipPlan.findMany({
      orderBy: { price: 'asc' },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          select: { id: true },
        },
      },
    });

    const formatted = plans.map((p) => ({
      ...p,
      features: JSON.parse(p.featuresJson || '[]'),
      activeMemberCount: p.memberships.length,
    }));

    return NextResponse.json({ plans: formatted });
  } catch (error: unknown) {
    console.error('Fetch plans error:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'members:write')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { name, durationMonths, durationDays, price, joiningFee = 0, features = [] } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const plan = await prisma.membershipPlan.create({
      data: {
        name,
        durationMonths: parseInt(durationMonths, 10) || 1,
        durationDays: parseInt(durationDays, 10) || (parseInt(durationMonths, 10) * 30),
        price: parseFloat(price),
        joiningFee: parseFloat(joiningFee),
        featuresJson: JSON.stringify(features),
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'CREATE_MEMBERSHIP_PLAN',
        entityType: 'MembershipPlan',
        entityId: plan.id,
        detailsJson: JSON.stringify({ name, price }),
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: unknown) {
    console.error('Create plan error:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'members:write')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, durationMonths, durationDays, price, joiningFee, features, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });
    }

    const updated = await prisma.membershipPlan.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(durationMonths !== undefined && { durationMonths: parseInt(durationMonths, 10) }),
        ...(durationDays !== undefined && { durationDays: parseInt(durationDays, 10) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(joiningFee !== undefined && { joiningFee: parseFloat(joiningFee) }),
        ...(features !== undefined && { featuresJson: JSON.stringify(features) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, plan: updated });
  } catch (error: unknown) {
    console.error('Update plan error:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}
