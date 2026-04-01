import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const allowed = await checkPermission(auth.userId, 'settings', 'view');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const email = new URL(request.url).searchParams.get('email');

    const list = await prisma.emailBlacklist.findMany({
      where: {
        organizationId: auth.organizationId,
        ...(email ? { email: { contains: email, mode: 'insensitive' } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error('Error fetching email blacklist:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const allowed = await checkPermission(auth.userId, 'settings', 'edit');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const saved = await prisma.emailBlacklist.upsert({
      where: {
        organizationId_email: {
          organizationId: auth.organizationId,
          email,
        },
      },
      create: {
        organizationId: auth.organizationId,
        email,
        reason: body?.reason || null,
        source: 'manual',
        createdById: auth.userId,
      },
      update: {
        reason: body?.reason || null,
      },
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error('Error saving email blacklist:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
