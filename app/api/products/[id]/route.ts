import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const { id } = await params;
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const hasPermission = await checkPermission(userId, 'products', 'view');
        if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        const record = await prisma.product.findFirst({
            where: {
                id,
                organizationId,
                deletedAt: null,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
                handler: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });

        if (!record) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                ...record,
                unitPrice: Number(record.unitPrice)
            }
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const { id } = await params;
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const hasPermission = await checkPermission(userId, 'products', 'edit');
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

        const updated = await prisma.product.update({
            where: {
                id,
                organizationId,
            },
            data: {
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
                unitPrice: unitPrice !== undefined ? BigInt(unitPrice) : undefined,
                commissionRate: commissionRate !== undefined ? parseFloat(commissionRate) : undefined,
                tax,
                taxable,
                usageUnit,
                qtyInStock,
                reorderLevel,
                handlerId,
                qtyInDemand,
                description,
                status,
            } as any,
        });

        return NextResponse.json({
            success: true,
            data: {
                ...updated,
                unitPrice: Number(updated.unitPrice)
            }
        }, { status: 200 });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const { id } = await params;
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { userId, organizationId } = auth;
        const hasPermission = await checkPermission(userId, 'products', 'delete');
        if (!hasPermission) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

        await prisma.product.update({
            where: {
                id,
                organizationId,
            },
            data: {
                deletedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, message: 'Product deleted' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
