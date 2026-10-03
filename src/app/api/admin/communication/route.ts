import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const templates = [
      {
        id: 'renewal-urgent',
        name: 'Membership Expiry Alert (1-3 Days)',
        template: 'Hi {{name}}! Your Iron Forge Gym membership expires in {{days}} days. Renew before expiry to lock in your current rate and keep your attendance streak alive! Stop by reception or reply to this message.',
      },
      {
        id: 'welcome-member',
        name: 'New Member Welcome Message',
        template: 'Welcome to Iron Forge Fitness, {{name}}! 🏋️ Your member ID is {{code}}. Download our PWA at https://ironforgegym.in/app to track your workouts, personal records, and check in. Let us know if you need anything!',
      },
      {
        id: 'miss-you',
        name: 'Absentee Retention (7+ Days Inactive)',
        template: 'Hey {{name}}! We missed seeing you at Iron Forge this week. Consistency is key to reaching your goals! Drop in today for a quick session—see you on the floor!',
      },
      {
        id: 'birthday-wish',
        name: 'Birthday Greeting & Perk',
        template: 'Happy Birthday from the entire team at Iron Forge, {{name}}! 🎉 May this year bring you PRs, health, and peak fitness. Enjoy a complimentary post-workout protein shake on us today!',
      },
    ];

    return NextResponse.json({ announcements, templates });
  } catch (error: unknown) {
    console.error('Fetch communication error:', error);
    return NextResponse.json({ error: 'Failed to fetch communication data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'announcements:write')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, targetSegment = 'ALL', isPinned = false } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        targetSegment,
        isPinned: !!isPinned,
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error: unknown) {
    console.error('Create announcement error:', error);
    return NextResponse.json({ error: 'Failed to broadcast announcement' }, { status: 500 });
  }
}
