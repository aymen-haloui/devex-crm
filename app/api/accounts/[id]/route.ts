import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkPermission(auth.userId, 'accounts', 'view');
    if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const account = await prisma.account.findFirst({
      where: { id, organizationId: auth.organizationId, deletedAt: null },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!account) return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: account }, { status: 200 });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkPermission(auth.userId, 'accounts', 'edit');
    if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.account.findFirst({
      where: { id, organizationId: auth.organizationId, deletedAt: null },
    });
    if (!existing) return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });

    const body = await request.json();

    const updated = await prisma.account.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        website: body.website ?? existing.website,
        tickerSymbol: body.tickerSymbol ?? existing.tickerSymbol,
        parentAccountId: body.parentAccountId ?? existing.parentAccountId,
        accountNumber: body.accountNumber ?? existing.accountNumber,
        type: body.type ?? existing.type,
        industry: body.industry ?? existing.industry,
        annualRevenue: body.annualRevenue !== undefined ? (body.annualRevenue === null ? null : BigInt(body.annualRevenue)) : existing.annualRevenue,
        employees: body.employees ?? existing.employees,
        rating: body.rating ?? existing.rating,
        phone: body.phone ?? existing.phone,
        fax: body.fax ?? existing.fax,
        ownership: body.ownership ?? existing.ownership,
        sicCode: body.sicCode ?? existing.sicCode,
        site: body.site ?? existing.site,
        billingStreet: body.billingStreet ?? existing.billingStreet,
        billingCity: body.billingCity ?? existing.billingCity,
        billingState: body.billingState ?? existing.billingState,
        billingZip: body.billingZip ?? existing.billingZip,
        billingCountry: body.billingCountry ?? existing.billingCountry,
        shippingStreet: body.shippingStreet ?? existing.shippingStreet,
        shippingCity: body.shippingCity ?? existing.shippingCity,
        shippingState: body.shippingState ?? existing.shippingState,
        shippingZip: body.shippingZip ?? existing.shippingZip,
        shippingCountry: body.shippingCountry ?? existing.shippingCountry,
        description: body.description ?? existing.description,
        status: body.status ?? existing.status,
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const hasPermission = await checkPermission(auth.userId, 'accounts', 'delete');
    if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const existing = await prisma.account.findFirst({
      where: { id, organizationId: auth.organizationId, deletedAt: null },
    });
    if (!existing) return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 });

    await prisma.account.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({ success: true, data: { id } }, { status: 200 });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

