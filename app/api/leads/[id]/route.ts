import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';
import { leadUpdateSchema } from '@/lib/validation/leads';

// GET /api/leads/[id] - Get a specific lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const auth = await getRequestAuthContext(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { userId, organizationId } = auth;

    const hasPermission = await checkPermission(userId, 'leads', 'view');
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const lead = await prisma.lead.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: lead },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/leads/[id] - Update a lead
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const auth = await getRequestAuthContext(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { userId, organizationId } = auth;

    const hasPermission = await checkPermission(userId, 'leads', 'edit');
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = leadUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid lead payload' },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        firstName: parsed.data.firstName ?? lead.firstName,
        lastName: parsed.data.lastName ?? lead.lastName,
        email: parsed.data.email ?? lead.email,
        phone: parsed.data.phone ?? lead.phone,
        company: parsed.data.company ?? lead.company,
        status: parsed.data.status ?? lead.status,
        source: parsed.data.source ?? lead.source,
        score: parsed.data.score ?? lead.score,
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/[id] - Delete a lead (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const auth = await getRequestAuthContext(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { userId, organizationId } = auth;

    const hasPermission = await checkPermission(userId, 'leads', 'delete');
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const lead = await prisma.lead.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(
      { success: true, data: { id } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
