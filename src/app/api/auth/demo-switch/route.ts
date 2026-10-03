import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken, TOKEN_COOKIE_NAME, TokenPayload } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();

    let targetEmail = 'owner@gymbuddy.com';
    if (role === 'MANAGER') targetEmail = 'manager@gymbuddy.com';
    if (role === 'TRAINER') targetEmail = 'trainer@gymbuddy.com';
    if (role === 'RECEPTIONIST') targetEmail = 'reception@gymbuddy.com';
    if (role === 'MEMBER') targetEmail = 'arjun@gmail.com';

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { member: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Demo user not found. Please re-seed database.' }, { status: 404 });
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role as TokenPayload['role'],
      name: user.name,
      memberId: user.member?.id,
    };

    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        memberId: user.member?.id,
        memberCode: user.member?.memberCode,
      },
      token,
      redirectUrl: user.role === 'MEMBER' ? '/app' : '/admin',
    });

    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: unknown) {
    console.error('Demo switch error:', error);
    return NextResponse.json({ error: 'Failed to switch demo account' }, { status: 500 });
  }
}
