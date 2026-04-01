import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';
import { safeParseSegmentRules, matchSegment } from '@/lib/marketing/segments';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const allowed = await checkPermission(auth.userId, 'campaigns', 'view');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const segment = await prisma.segment.findFirst({
      where: { id, organizationId: auth.organizationId, isActive: true },
    });

    if (!segment) {
      return NextResponse.json({ success: false, error: 'Segment not found' }, { status: 404 });
    }

    const rules = safeParseSegmentRules(segment.rulesJson);

    const entities = segment.entityType === 'contact'
      ? await prisma.contact.findMany({ where: { organizationId: auth.organizationId, deletedAt: null } })
      : await prisma.lead.findMany({ where: { organizationId: auth.organizationId, deletedAt: null } });

    const emailHistory = await prisma.emailLog.groupBy({
      by: ['recipientEmail', 'status'],
      where: { organizationId: auth.organizationId },
      _count: true,
    });

    const historyByEmail = new Map<string, { sentCount: number; openCount: number; clickCount: number }>();
    for (const row of emailHistory) {
      const existing = historyByEmail.get(row.recipientEmail) || { sentCount: 0, openCount: 0, clickCount: 0 };
      if (['sent', 'opened', 'clicked'].includes(row.status)) existing.sentCount += row._count;
      if (['opened', 'clicked'].includes(row.status)) existing.openCount += row._count;
      if (row.status === 'clicked') existing.clickCount += row._count;
      historyByEmail.set(row.recipientEmail, existing);
    }

    const matched = entities.filter((entity) => {
      const customFields = (entity as { customFields?: unknown }).customFields;
      const metrics = historyByEmail.get(entity.email) || { sentCount: 0, openCount: 0, clickCount: 0 };
      return matchSegment(
        entity as unknown as Record<string, unknown>,
        customFields && typeof customFields === 'object' && !Array.isArray(customFields)
          ? (customFields as Record<string, unknown>)
          : {},
        rules,
        metrics
      );
    });

    return NextResponse.json({
      success: true,
      data: {
        segmentId: segment.id,
        count: matched.length,
        sample: matched.slice(0, 20),
      },
    });
  } catch (error) {
    console.error('Error previewing segment:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
