import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';
import { serialize } from '@/lib/api-helpers';


export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { userId, organizationId } = auth;
    const hasPermission = await checkPermission(userId, 'products', 'view');
    if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const id = searchParams.get('id');

    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (id) {
      where.id = id;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { productCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.productCategory = category;
    }

    const records = await prisma.product.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        handler: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: serialize(records) }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { userId, organizationId } = auth;
    const hasPermission = await checkPermission(userId, 'products', 'create');
    if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const {
      name,
      sku,
      image,
      productCode,
      vendorName,
      manufacturer,
      productCategory,
      salesStartDate,
      salesEndDate,
      supportStartDate,
      supportEndDate,
      unitPrice,
      commissionRate,
      tax,
      taxable,
      usageUnit,
      qtyInStock,
      reorderLevel,
      handlerId,
      qtyInDemand,
      description,
      status,
    } = body;

    if (!name || !sku || unitPrice === undefined) {
      return NextResponse.json({ success: false, error: 'Name, SKU and unit price are required' }, { status: 400 });
    }

    const created = await prisma.product.create({
      data: {
        organizationId,
        name,
        sku,
        image,
        productCode,
        vendorName,
        manufacturer,
        productCategory,
        salesStartDate: salesStartDate ? new Date(salesStartDate) : null,
        salesEndDate: salesEndDate ? new Date(salesEndDate) : null,
        supportStartDate: supportStartDate ? new Date(supportStartDate) : null,
        supportEndDate: supportEndDate ? new Date(supportEndDate) : null,
        unitPrice: BigInt(unitPrice),
        commissionRate: commissionRate ? parseFloat(commissionRate) : null,
        tax,
        taxable: taxable ?? true,
        usageUnit,
        qtyInStock: qtyInStock ?? 0,
        reorderLevel: reorderLevel ?? 0,
        handlerId,
        qtyInDemand: qtyInDemand ?? 0,
        description,
        status: status || 'active',
        ownerId: userId,
      } as any, // Cast to any to avoid BigInt type issues with common Prisma client configurations
    });

    return NextResponse.json({
      success: true,
      data: serialize(created)
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
