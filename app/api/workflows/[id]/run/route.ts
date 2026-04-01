import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

function getActionValue(actionJson: unknown, key: string): unknown {
  if (!actionJson || typeof actionJson !== 'object' || Array.isArray(actionJson)) return undefined;
  return (actionJson as Record<string, unknown>)[key];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { userId, organizationId } = auth;
    const allowed = await checkPermission(userId, 'workflows', 'execute');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const workflow = await prisma.workflow.findFirst({
      where: { id, organizationId, deletedAt: null, isActive: true },
    });

    if (!workflow) {
      return NextResponse.json({ success: false, error: 'Workflow not found or inactive' }, { status: 404 });
    }

    const body = await request.json();
    const targetId = body?.targetId as string | undefined;

    let message = 'Workflow executed';

    if (workflow.targetModule === 'leads' && targetId) {
      const incrementRaw = getActionValue(workflow.actionJson, 'leadScoreIncrement');
      const increment = typeof incrementRaw === 'number' ? incrementRaw : 5;

      const lead = await prisma.lead.findFirst({
        where: { id: targetId, organizationId, deletedAt: null },
      });

      if (!lead) {
        await prisma.workflowExecution.create({
          data: {
            organizationId,
            workflowId: workflow.id,
            targetId,
            status: 'failed',
            message: 'Lead not found',
            executedById: userId,
          },
        });

        return NextResponse.json({ success: false, error: 'Target lead not found' }, { status: 404 });
      }

      await prisma.lead.update({
        where: { id: lead.id },
        data: { score: lead.score + increment },
      });

      const createActivity = Boolean(getActionValue(workflow.actionJson, 'createActivity'));
      if (createActivity) {
        await prisma.activity.create({
          data: {
            organizationId,
            type: 'task',
            title: `Workflow follow-up: ${workflow.name}`,
            description: `Automated follow-up created for lead ${lead.firstName} ${lead.lastName}`,
            ownerId: userId,
            relatedToId: lead.id,
            relatedToType: 'Lead',
            status: 'open',
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
          },
        });
      }

      message = `Lead updated (+${increment} score)${createActivity ? ' and follow-up activity created' : ''}`;
    }

    if (workflow.targetModule === 'cases' && targetId) {
      const escalateRaw = getActionValue(workflow.actionJson, 'escalateLevel');
      const escalateLevel = typeof escalateRaw === 'number' ? escalateRaw : 1;

      const existingCase = await prisma.case.findFirst({
        where: { id: targetId, organizationId, deletedAt: null },
      });

      if (!existingCase) {
        await prisma.workflowExecution.create({
          data: {
            organizationId,
            workflowId: workflow.id,
            targetId,
            status: 'failed',
            message: 'Case not found',
            executedById: userId,
          },
        });

        return NextResponse.json({ success: false, error: 'Target case not found' }, { status: 404 });
      }

      await prisma.case.update({
        where: { id: existingCase.id },
        data: {
          escalationLevel: existingCase.escalationLevel + escalateLevel,
          escalatedAt: new Date(),
          status: existingCase.status === 'resolved' ? 'resolved' : 'pending',
        },
      });

      message = `Case escalated (+${escalateLevel})`;
    }

    const execution = await prisma.workflowExecution.create({
      data: {
        organizationId,
        workflowId: workflow.id,
        targetId: targetId || null,
        status: 'success',
        message,
        executedById: userId,
      },
    });

    return NextResponse.json({ success: true, data: execution }, { status: 200 });
  } catch (error) {
    console.error('Error running workflow:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
