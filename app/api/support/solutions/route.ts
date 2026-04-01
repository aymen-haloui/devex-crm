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
        const search = searchParams.get('search');
        const status = searchParams.get('status');

        const where: any = { organizationId };

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { solutionNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status) where.status = status;

        const solutions = await prisma.solution.findMany({
            where,
            include: {
                owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                product: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, data: solutions });
    } catch (error: any) {
        console.error('Error fetching solutions:', error);
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

        // Generate solution number
        const solCount = await prisma.solution.count({
            where: { organizationId }
        });
        const solutionNumber = `SOL-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(solCount + 1).padStart(4, '0')}`;

        const newSolution = await prisma.solution.create({
            data: {
                ...data,
                organizationId,
                ownerId: authContext.userId,
                solutionNumber,
                productId: data.productId || null,
                dealId: data.dealId || null,
            },
            include: {
                owner: { select: { id: true, firstName: true, lastName: true, email: true } },
            }
        });

        return NextResponse.json({ success: true, data: newSolution });
    } catch (error: any) {
        console.error('Error creating solution:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
