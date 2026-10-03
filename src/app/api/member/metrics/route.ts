import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

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

    const metrics = await prisma.bodyMetric.findMany({
      where: { memberId: member.id },
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({
      metrics,
      currentWeight: member.weightKg,
      currentHeight: member.heightCm,
      goal: member.fitnessGoal,
    });
  } catch (error: unknown) {
    console.error('Fetch metrics error:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
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
    const { weightKg, chestCm, waistCm, hipsCm, armsCm, thighsCm, bodyFatPercent, notes } = body;

    const metric = await prisma.bodyMetric.create({
      data: {
        memberId: member.id,
        date: new Date(),
        weightKg: weightKg ? parseFloat(weightKg) : null,
        chestCm: chestCm ? parseFloat(chestCm) : null,
        waistCm: waistCm ? parseFloat(waistCm) : null,
        hipsCm: hipsCm ? parseFloat(hipsCm) : null,
        armsCm: armsCm ? parseFloat(armsCm) : null,
        thighsCm: thighsCm ? parseFloat(thighsCm) : null,
        bodyFatPercent: bodyFatPercent ? parseFloat(bodyFatPercent) : null,
        notes,
      },
    });

    if (weightKg) {
      await prisma.member.update({
        where: { id: member.id },
        data: { weightKg: parseFloat(weightKg) },
      });
    }

    return NextResponse.json({ success: true, metric });
  } catch (error: unknown) {
    console.error('Log metric error:', error);
    return NextResponse.json({ error: 'Failed to log metric' }, { status: 500 });
  }
}
