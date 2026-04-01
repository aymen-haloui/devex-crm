import { NextRequest, NextResponse } from "next/server";
import { getRequestAuthContext } from "@/lib/request-auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
    try {
        const auth = await getRequestAuthContext(req);
        if (!auth?.userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const solutionData = await prisma.solution.findUnique({
            where: {
                id: params.id,
                organizationId: auth.organizationId,
            },
            include: {
                owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                product: { select: { id: true, name: true } },
            },
        });

        if (!solutionData) {
            return NextResponse.json({ success: false, error: 'Solution not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: solutionData });
    } catch (error: any) {
        console.error('Error fetching solution:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
    try {
        const auth = await getRequestAuthContext(req);
        if (!auth?.organizationId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const { id: _, solutionNumber, organizationId, createdAt, updatedAt, ...updateData } = data;

        const existingSol = await prisma.solution.findUnique({
            where: { id: params.id, organizationId: auth.organizationId }
        });

        if (!existingSol) {
            return NextResponse.json({ success: false, error: 'Solution not found' }, { status: 404 });
        }

        const updatedSol = await prisma.solution.update({
            where: { id: params.id },
            data: updateData,
            include: {
                owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                product: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({ success: true, data: updatedSol });
    } catch (error: any) {
        console.error('Error updating solution:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
    try {
        const auth = await getRequestAuthContext(req);
        if (!auth?.organizationId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const solutionData = await prisma.solution.findUnique({
            where: { id: params.id, organizationId: auth.organizationId }
        });

        if (!solutionData) {
            return NextResponse.json({ success: false, error: 'Solution not found' }, { status: 404 });
        }

        await prisma.solution.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true, data: null });
    } catch (error: any) {
        console.error('Error deleting solution:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
