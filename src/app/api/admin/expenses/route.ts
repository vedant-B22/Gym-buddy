import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'expenses:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // YYYY-MM

    // Fetch expenses
    const expenses = await prisma.expense.findMany({
      orderBy: { expenseDate: 'desc' },
      take: 100,
    });

    // Calculate total expenses & category breakdown
    let totalExpenses = 0;
    const categoryTotals: Record<string, number> = {};

    expenses.forEach((e) => {
      totalExpenses += e.amount;
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    // Fetch total revenue from membership payments
    const payments = await prisma.payment.findMany({
      where: { isVoid: false },
      select: { amount: true, createdAt: true, paymentMode: true },
    });

    const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    // Monthly revenue vs expenses (last 6 months)
    const monthlySummary: Record<string, { revenue: number; expenses: number }> = {};

    // Group payments
    payments.forEach((p) => {
      const monthKey = p.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlySummary[monthKey]) monthlySummary[monthKey] = { revenue: 0, expenses: 0 };
      monthlySummary[monthKey].revenue += p.amount;
    });

    // Group expenses
    expenses.forEach((e) => {
      const monthKey = e.expenseDate.slice(0, 7);
      if (!monthlySummary[monthKey]) monthlySummary[monthKey] = { revenue: 0, expenses: 0 };
      monthlySummary[monthKey].expenses += e.amount;
    });

    return NextResponse.json({
      expenses,
      metrics: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        categoryTotals,
        monthlySummary,
      },
    });
  } catch (error: unknown) {
    console.error('Fetch expenses error:', error);
    return NextResponse.json({ error: 'Failed to fetch financial reports' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'expenses:write')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { title, category, amount, expenseDate, paymentMode, notes } = body;

    if (!title || !amount || !category) {
      return NextResponse.json({ error: 'Title, category, and amount are required' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        category,
        amount: parseFloat(amount),
        expenseDate: expenseDate || new Date().toISOString().split('T')[0],
        paymentMode: paymentMode || 'UPI',
        notes,
        recordedByUserId: session.userId,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: unknown) {
    console.error('Create expense error:', error);
    return NextResponse.json({ error: 'Failed to record expense' }, { status: 500 });
  }
}
