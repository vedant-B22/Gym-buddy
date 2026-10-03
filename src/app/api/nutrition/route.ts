import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const search = searchParams.get('search');

    let member = await prisma.member.findFirst({
      where: session?.memberId ? { id: session.memberId } : { userId: session?.userId },
      include: {
        dietPlans: { where: { isActive: true }, take: 1 },
      },
    });

    if (!member) {
      member = await prisma.member.findFirst({
        where: { memberCode: 'IF-1001' },
        include: { dietPlans: { where: { isActive: true }, take: 1 } },
      });
    }

    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    // Fetch food logs for today
    const [foodLogs, waterLogs, allFoods] = await Promise.all([
      prisma.nutritionLog.findMany({
        where: { memberId: member.id, dateString: dateStr },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.waterLog.findMany({
        where: { memberId: member.id, dateString: dateStr },
      }),
      search
        ? prisma.food.findMany({
            where: {
              OR: [
                { name: { contains: search } },
                { hindiName: { contains: search } },
                { category: { contains: search } },
              ],
            },
            take: 25,
          })
        : prisma.food.findMany({ take: 25 }),
    ]);

    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const log of foodLogs) {
      totalCalories += log.calories;
      totalProtein += log.protein;
      totalCarbs += log.carbs;
      totalFat += log.fat;
    }

    const totalWaterMl = waterLogs.reduce((acc, w) => acc + w.amountMl, 0);

    const dietPlan = member.dietPlans?.[0] || {
      dailyCaloriesTarget: 2400,
      proteinTarget: 150,
      carbsTarget: 280,
      fatTarget: 65,
      waterTargetMl: 3000,
    };

    return NextResponse.json({
      date: dateStr,
      logs: foodLogs,
      waterMl: totalWaterMl,
      totals: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
      },
      targets: dietPlan,
      foods: allFoods,
    });
  } catch (error: unknown) {
    console.error('Fetch nutrition error:', error);
    return NextResponse.json({ error: 'Failed to fetch nutrition data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    let member = await prisma.member.findFirst({
      where: session?.memberId ? { id: session.memberId } : { userId: session?.userId },
    });
    if (!member) member = await prisma.member.findFirst({ where: { memberCode: 'IF-1001' } });
    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    const body = await req.json();
    const { action, date = new Date().toISOString().split('T')[0] } = body;

    // Log Water
    if (action === 'LOG_WATER') {
      const { amountMl = 250 } = body;
      await prisma.waterLog.create({
        data: {
          memberId: member.id,
          dateString: date,
          amountMl: parseInt(amountMl, 10),
        },
      });
      return NextResponse.json({ success: true, message: `Added +${amountMl}ml water` });
    }

    // Log Food
    if (action === 'LOG_FOOD') {
      const { foodId, foodName, mealType = 'LUNCH', servingQty = 1, calories, protein, carbs, fat } = body;

      const log = await prisma.nutritionLog.create({
        data: {
          memberId: member.id,
          dateString: date,
          mealType,
          foodId: foodId || null,
          foodName: foodName || 'Food Item',
          servingQty: parseFloat(servingQty) || 1,
          calories: parseFloat(calories) || 0,
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          fat: parseFloat(fat) || 0,
        },
      });

      return NextResponse.json({ success: true, log });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Log nutrition error:', error);
    return NextResponse.json({ error: 'Failed to log nutrition' }, { status: 500 });
  }
}
