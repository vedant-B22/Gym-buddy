import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSessionUser, hasPermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'leads:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { name: true } },
        convertedMember: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json({ leads });
  } catch (error: unknown) {
    console.error('Fetch leads error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, fitnessGoal, preferredTime, source = 'WEBSITE', notes } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');

    const lead = await prisma.lead.create({
      data: {
        name,
        phone: cleanPhone,
        email: email ? email.trim().toLowerCase() : null,
        fitnessGoal: fitnessGoal || 'General Fitness',
        preferredTime: preferredTime || 'Any',
        source,
        status: 'NEW',
        notes: notes || 'Enquiry submitted via website free trial form',
      },
    });

    // Notify staff of new lead
    const staffUsers = await prisma.user.findMany({
      where: { role: { in: ['OWNER', 'MANAGER', 'RECEPTIONIST'] } },
    });

    for (const staff of staffUsers) {
      await prisma.notification.create({
        data: {
          userId: staff.id,
          title: `🎯 New Lead: ${name}`,
          message: `${name} requested a free trial (${cleanPhone}, Goal: ${fitnessGoal || 'Fitness'}). Source: ${source}`,
          type: 'ANNOUNCEMENT',
          linkUrl: '/admin/leads',
        },
      });
    }

    return NextResponse.json({ success: true, lead, message: 'Free trial request received! Our team will contact you shortly.' });
  } catch (error: unknown) {
    console.error('Create lead error:', error);
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'leads:write')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, notes, trialDate, convertToMember } = body;

    if (!id) return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    // 1-Click Convert Lead to Member
    if (convertToMember) {
      const existingUser = await prisma.user.findFirst({
        where: { phone: lead.phone },
      });

      if (existingUser) {
        return NextResponse.json({ error: 'A user with this phone number already exists' }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          name: lead.name,
          phone: lead.phone,
          email: lead.email || `${lead.phone}@ironforge.internal`,
          passwordHash,
          role: 'MEMBER',
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.name}`,
        },
      });

      const memberCount = await prisma.member.count();
      const memberCode = `IF-${1001 + memberCount}`;

      const member = await prisma.member.create({
        data: {
          userId: user.id,
          memberCode,
          fitnessGoal: lead.fitnessGoal,
          referralCode: `FORGE${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'ACTIVE',
        },
      });

      await prisma.lead.update({
        where: { id },
        data: {
          status: 'CONVERTED',
          convertedMemberId: member.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully converted ${lead.name} to member ${memberCode}!`,
        memberId: member.id,
      });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(trialDate !== undefined && { trialDate }),
      },
    });

    return NextResponse.json({ success: true, lead: updated });
  } catch (error: unknown) {
    console.error('Update lead error:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
