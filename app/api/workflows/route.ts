import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { userId, organizationId } = auth;
    const allowed = await checkPermission(userId, 'workflows', 'view');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const workflows = await prisma.workflow.findMany({
      where: { organizationId, deletedAt: null },
      include: {
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: workflows }, { status: 200 });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { userId, organizationId } = auth;
    const allowed = await checkPermission(userId, 'workflows', 'create');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { name, description, triggerType, targetModule, actionJson, conditionJson, isActive } = body;

    if (!name || !targetModule || !actionJson) {
      return NextResponse.json(
        { success: false, error: 'Name, target module and action configuration are required' },
        { status: 400 }
      );
    }

    const created = await prisma.workflow.create({
      data: {
        organizationId,
        name,
        description,
        triggerType: triggerType || 'manual',
        targetModule,
        actionJson,
        conditionJson: conditionJson || null,
        isActive: isActive ?? true,
        ownerId: userId,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
