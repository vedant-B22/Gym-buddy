import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, hasPermission } from '@/lib/auth';
import { generateRotatingQrToken } from '@/lib/business-logic';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'attendance:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { token, expiresAt } = generateRotatingQrToken('main-branch');
    const secondsRemaining = Math.max(1, Math.round((expiresAt - Date.now()) / 1000));

    return NextResponse.json({
      token,
      expiresAt,
      secondsRemaining,
      gymName: 'IRON FORGE FITNESS',
      branch: 'Indiranagar Main',
    });
  } catch (error: unknown) {
    console.error('Rotate QR error:', error);
    return NextResponse.json({ error: 'Failed to generate rotating QR' }, { status: 500 });
  }
}
