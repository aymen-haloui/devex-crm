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
    const { name, folder, selectedModule, relatedModules, selectedColumns, filters } = body;

    const report = await prisma.report.create({
      data: {
        organizationId: auth.organizationId,
        name,
        folder,
        config: {
          selectedModule,
          relatedModules,
          selectedColumns,
          filters,
        },
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('Error saving report:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
