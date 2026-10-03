import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'settings:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const settingsRecords = await prisma.setting.findMany();
    const settingsMap: Record<string, any> = {};

    settingsRecords.forEach((s) => {
      try {
        settingsMap[s.key] = JSON.parse(s.valueJson);
      } catch {
        settingsMap[s.key] = s.valueJson;
      }
    });

    // Provide robust defaults if not configured
    const defaultProfile = {
      gymName: 'Iron Forge Fitness',
      tagline: 'High Performance Strength & Conditioning',
      phone: '+91 98765 43210',
      email: 'contact@ironforgefitness.in',
      address: '42, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
      gstin: '29AAAAA0000A1Z5',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      maxCapacity: 75,
      crowdWarningThreshold: 80, // %
    };

    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
      include: { user: { select: { name: true, role: true } } },
    });

    return NextResponse.json({
      settings: {
        gym_profile: settingsMap['gym_profile'] || defaultProfile,
        capacity_config: settingsMap['capacity_config'] || { maxCapacity: 75, peakAlertThreshold: 80 },
        theme_config: settingsMap['theme_config'] || { accentColor: 'emerald', defaultTheme: 'dark' },
      },
      auditLogs,
    });
  } catch (error: unknown) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'settings:write')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    const valueJson = typeof value === 'object' ? JSON.stringify(value) : String(value);

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { valueJson },
      create: { key, valueJson },
    });

    // Log the change in AuditLog
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'UPDATE_SETTINGS',
        entityType: 'Setting',
        entityId: key,
        detailsJson: JSON.stringify({ key, value }),
      },
    });

    return NextResponse.json({ success: true, setting });
  } catch (error: unknown) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
