import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await getRequestAuthContext(req);
    if (!auth?.userId || !auth?.organizationId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { selectedModule } = body;
    const organizationId = auth.organizationId;

    const moduleName = typeof selectedModule?.name === 'string' ? selectedModule.name : '';

    let data: unknown[] = [];
    const baseQuery = {
      where: { organizationId },
      take: 10,
      orderBy: { createdAt: 'desc' } as const,
    };

    switch (moduleName) {
      case 'leads':
        data = await prisma.lead.findMany(baseQuery);
        break;
      case 'contacts':
        data = await prisma.contact.findMany(baseQuery);
        break;
      case 'accounts':
        data = await prisma.account.findMany(baseQuery);
        break;
      case 'deals':
        data = await prisma.deal.findMany(baseQuery);
        break;
      case 'campaigns':
        data = await prisma.campaign.findMany(baseQuery);
        break;
      default:
        data = [];
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error previewing report:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
