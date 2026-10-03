import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const muscleGroup = searchParams.get('muscleGroup');
    const equipment = searchParams.get('equipment');

    const where: any = {};
    if (muscleGroup && muscleGroup !== 'ALL') where.muscleGroup = muscleGroup;
    if (equipment && equipment !== 'ALL') where.equipment = equipment;

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { muscleGroup: { contains: q } },
        { secondaryMuscles: { contains: q } },
        { equipment: { contains: q } },
      ];
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ exercises });
  } catch (error: unknown) {
    console.error('Fetch exercises error:', error);
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
  }
}
