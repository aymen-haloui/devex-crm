import { NextRequest, NextResponse } from "next/server";
import { getRequestAuthContext } from "@/lib/request-auth";
import { checkPermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const auth = await getRequestAuthContext(req);
        if (!auth?.userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const hasPermission = await checkPermission(auth.userId, 'cases', 'view');
        if (!hasPermission) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const caseData = await prisma.case.findUnique({
            where: {
                id,
                organizationId: auth.organizationId,
                deletedAt: null,
            },
            include: {
                owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                account: { select: { id: true, name: true } },
                contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
                deal: { select: { id: true, name: true } },
                product: { select: { id: true, name: true } },
            },
        });

        if (!caseData) {
            return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: caseData });
    } catch (error: any) {
        console.error('Error fetching case:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const auth = await getRequestAuthContext(req);
        if (!auth?.userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const hasPermission = await checkPermission(auth.userId, 'cases', 'edit');
        if (!hasPermission) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const data = await req.json();
        const { id: _, caseNumber, organizationId, createdAt, updatedAt, ...updateData } = data;

        const existingCase = await prisma.case.findUnique({
            where: { id, organizationId: auth.organizationId, deletedAt: null }
        });

        if (!existingCase) {
            return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });
        }

        // Set resolved details if status changed to closed
        if (updateData.status === 'closed' && existingCase.status !== 'closed') {
            updateData.resolvedAt = new Date();
        } else if (updateData.status !== 'closed') {
            updateData.resolvedAt = null;
        }

        const updatedCase = await prisma.case.update({
            where: { id },
            data: updateData,
            include: {
                owner: { select: { id: true, firstName: true, lastName: true, email: true } },
                account: { select: { id: true, name: true } },
                contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
                deal: { select: { id: true, name: true } },
                product: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({ success: true, data: updatedCase });
    } catch (error: any) {
        console.error('Error updating case:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const auth = await getRequestAuthContext(req);
        if (!auth?.userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const hasPermission = await checkPermission(auth.userId, 'cases', 'delete');
        if (!hasPermission) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const existing = await prisma.case.findUnique({
            where: { id, organizationId: auth.organizationId, deletedAt: null }
        });

        if (!existing) {
            return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });
        }

        await prisma.case.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        return NextResponse.json({ success: true, data: null });
    } catch (error: any) {
        console.error('Error deleting case:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
