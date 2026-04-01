import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId } = auth;
    const allowed = await checkPermission(auth.userId, 'campaigns', 'view');
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const includeInactive = new URL(request.url).searchParams.get('includeInactive') === 'true';

    const templates = await prisma.emailTemplate.findMany({
      where: { organizationId, ...(includeInactive ? {} : { isActive: true }) },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: templates });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId, userId } = auth;
    const allowed = await checkPermission(userId, 'campaigns', 'create');
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, subject, previewText, htmlContent, textContent, designJson, imageUrls } = body;

    if (!name || !subject || !htmlContent) {
      return NextResponse.json(
        { success: false, error: 'Name, subject, and HTML content are required' },
        { status: 400 }
      );
    }

    const template = await prisma.emailTemplate.create({
      data: {
        organizationId,
        name,
        subject,
        previewText: previewText || null,
        htmlContent,
        textContent: textContent || null,
        designJson: designJson ?? null,
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      },
    });

    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (error) {
    console.error('Error creating email template:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
