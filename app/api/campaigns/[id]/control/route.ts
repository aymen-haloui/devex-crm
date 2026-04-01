import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { userId, organizationId } = auth;
    const allowed = await checkPermission(userId, 'campaigns', 'update');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const action = String(body?.action || '').toLowerCase();

    const campaign = await prisma.campaign.findFirst({
      where: { id, organizationId, deletedAt: null },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    if (!['pause', 'resume', 'cancel'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    const data: {
      status?: string;
      pausedAt?: Date | null;
      resumedAt?: Date | null;
      cancelledAt?: Date | null;
      processingLockUntil?: Date | null;
    } = {};

    if (action === 'pause') {
      data.status = 'paused';
      data.pausedAt = new Date();
      data.processingLockUntil = null;
    }

    if (action === 'resume') {
      data.status = campaign.scheduledAt && campaign.scheduledAt > new Date() ? 'scheduled' : 'sending';
      data.resumedAt = new Date();
      data.processingLockUntil = null;
    }

    if (action === 'cancel') {
      data.status = 'cancelled';
      data.cancelledAt = new Date();
      data.processingLockUntil = null;
    }

    const updated = await prisma.campaign.update({
      where: { id: campaign.id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error controlling campaign:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
