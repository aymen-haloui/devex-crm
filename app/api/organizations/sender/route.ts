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

    const organization = await prisma.organization.findUnique({
      where: { id: auth.organizationId },
      select: {
        id: true,
        name: true,
        senderName: true,
        senderEmail: true,
        senderReplyTo: true,
        timezone: true,
      },
    });

    return NextResponse.json({ success: true, data: organization });
  } catch (error) {
    console.error('Error fetching sender config:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const allowed = await checkPermission(auth.userId, 'settings', 'edit');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();

    const updated = await prisma.organization.update({
      where: { id: auth.organizationId },
      data: {
        senderName: body?.senderName ?? null,
        senderEmail: body?.senderEmail ?? null,
        senderReplyTo: body?.senderReplyTo ?? null,
        timezone: body?.timezone ?? undefined,
      },
      select: {
        id: true,
        name: true,
        senderName: true,
        senderEmail: true,
        senderReplyTo: true,
        timezone: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating sender config:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
