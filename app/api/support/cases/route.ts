import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRequestAuthContext } from "@/lib/request-auth";

export async function GET(req: NextRequest) {
    try {
        const authContext = await getRequestAuthContext(req);
        if (!authContext) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId } = authContext;
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');

        const where: any = {
            organizationId,
            deletedAt: null
        };

        if (search) {
            where.OR = [
                { subject: { contains: search, mode: 'insensitive' } },
                { caseNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status) where.status = status;
        if (priority) where.priority = priority;

        const [cases, total] = await Promise.all([
            prisma.case.findMany({
                where,
                include: {
                    owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                    account: { select: { id: true, name: true } },
                    contact: { select: { id: true, firstName: true, lastName: true } },
                    product: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.case.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            data: cases,
            meta: {
                page,
                limit,
                total,
                hasMore: page * limit < total
            }
        });
    } catch (error: any) {
        console.error('Error fetching cases:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const authContext = await getRequestAuthContext(req);
        if (!authContext) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId } = authContext;

        const data = await req.json();

        // Generate case number
        const caseCount = await prisma.case.count({
            where: { organizationId }
        });
        const caseNumber = `CAS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(caseCount + 1).padStart(4, '0')}`;

        const newCase = await prisma.case.create({
            data: {
                ...data,
                organizationId,
                ownerId: authContext.userId,
                caseNumber,
                productId: data.productId || null,
                accountId: data.accountId || null,
                contactId: data.contactId || null,
                dealId: data.dealId || null,
            },
            include: {
                owner: { select: { id: true, firstName: true, lastName: true, email: true } },
            }
        });

        return NextResponse.json({ success: true, data: newCase });
    } catch (error: any) {
        console.error('Error creating case:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
