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
    if (!member) {
      member = await prisma.member.findFirst({ where: { memberCode: 'IF-1001' } });
    }
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    const [workouts, personalRecords] = await Promise.all([
      prisma.workout.findMany({
        where: { memberId: member.id },
        orderBy: { createdAt: 'desc' },
        include: {
          sets: {
            include: { exercise: { select: { id: true, name: true, muscleGroup: true } } },
          },
        },
      }),
      prisma.personalRecord.findMany({
        where: { memberId: member.id },
        orderBy: { achievedAt: 'desc' },
        include: { exercise: { select: { id: true, name: true } } },
      }),
    ]);

    return NextResponse.json({ workouts, personalRecords });
  } catch (error: unknown) {
    console.error('Fetch workouts error:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let member = await prisma.member.findFirst({
      where: session.memberId ? { id: session.memberId } : { userId: session.userId },
    });
    if (!member) {
      member = await prisma.member.findFirst({ where: { memberCode: 'IF-1001' } });
    }
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    const body = await req.json();
    const { name, durationSeconds = 0, notes, feelingRating, sets = [] } = body;

    // 1. Calculate total volume
    let totalVolumeKg = 0;
    for (const s of sets) {
      if (s.isCompleted && !s.isWarmup && s.weightKg && s.reps) {
        totalVolumeKg += s.weightKg * s.reps;
      }
    }

    // 2. Create Workout record
    const workout = await prisma.workout.create({
      data: {
        memberId: member.id,
        name: name || 'Gym Session',
        durationSeconds: parseInt(durationSeconds, 10) || 0,
        totalVolumeKg,
        notes,
        feelingRating: feelingRating ? parseInt(feelingRating, 10) : 5,
        isCompleted: true,
      },
    });

    // 3. Create WorkoutSet records
    if (sets.length > 0) {
      await prisma.workoutSet.createMany({
        data: sets.map((s: any, idx: number) => ({
          workoutId: workout.id,
          exerciseId: s.exerciseId,
          setNumber: idx + 1,
          reps: parseInt(s.reps, 10) || 0,
          weightKg: parseFloat(s.weightKg) || 0,
          rpe: s.rpe ? parseFloat(s.rpe) : null,
          isWarmup: !!s.isWarmup,
          isDropSet: !!s.isDropSet,
          isCompleted: !!s.isCompleted,
        })),
      });
    }

    // 4. Automatic PR Detection
    const newPrs: Array<{ exerciseName: string; type: string; value: number }> = [];

    // Group sets by exercise
    const exerciseSetsMap: Record<string, any[]> = {};
    for (const s of sets) {
      if (s.isCompleted && !s.isWarmup && s.weightKg > 0 && s.reps > 0) {
        if (!exerciseSetsMap[s.exerciseId]) exerciseSetsMap[s.exerciseId] = [];
        exerciseSetsMap[s.exerciseId].push(s);
      }
    }

    for (const [exerciseId, exSets] of Object.entries(exerciseSetsMap)) {
      const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
      if (!exercise) continue;

      // Find max weight lifted in this workout for this exercise
      let sessionMaxWeight = 0;
      let sessionMax1RM = 0;

      for (const s of exSets) {
        if (s.weightKg > sessionMaxWeight) sessionMaxWeight = s.weightKg;
        // Brzycki 1RM formula: weight * (36 / (37 - reps))
        const est1RM = Math.round(s.weightKg * (36 / Math.max(1, 37 - Math.min(30, s.reps))));
        if (est1RM > sessionMax1RM) sessionMax1RM = est1RM;
      }

      // Check existing historical max weight
      const existingMaxWeightPR = await prisma.personalRecord.findFirst({
        where: {
          memberId: member.id,
          exerciseId,
          recordType: 'MAX_WEIGHT',
        },
        orderBy: { value: 'desc' },
      });

      if (!existingMaxWeightPR || sessionMaxWeight > existingMaxWeightPR.value) {
        await prisma.personalRecord.create({
          data: {
            memberId: member.id,
            exerciseId,
            recordType: 'MAX_WEIGHT',
            value: sessionMaxWeight,
            workoutId: workout.id,
          },
        });

        newPrs.push({
          exerciseName: exercise.name,
          type: 'Max Weight',
          value: sessionMaxWeight,
        });
      }
    }

    // 5. Update Member streak & last workout timestamp
    await prisma.member.update({
      where: { id: member.id },
      data: {
        lastWorkoutDate: new Date(),
        streakCurrent: { increment: 1 },
      },
    });

    // 6. Award badges (PR Breaker if new PR detected)
    if (newPrs.length > 0) {
      const prBadge = await prisma.badge.findFirst({ where: { code: 'PR_BREAKER' } });
      if (prBadge) {
        const hasBadge = await prisma.memberBadge.findFirst({
          where: { memberId: member.id, badgeId: prBadge.id },
        });
        if (!hasBadge) {
          await prisma.memberBadge.create({
            data: { memberId: member.id, badgeId: prBadge.id },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      workoutId: workout.id,
      totalVolumeKg,
      newPrs,
    });
  } catch (error: unknown) {
    console.error('Save workout error:', error);
    return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 });
  }
}
