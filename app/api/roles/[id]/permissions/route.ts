import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id: roleId } = await params;
        const body = await req.json();
        const { permissionIds } = body;

        if (!Array.isArray(permissionIds)) {
            return NextResponse.json({ success: false, error: 'Invalid Payload' }, { status: 400 });
        }

        // Verify role belongs to org
        const role = await prisma.role.findUnique({
            where: { id: roleId, organizationId: user.organizationId }
        });

        if (!role) {
            return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
        }

        // Wrap in a transaction to replace old permissions completely
        await prisma.$transaction(async (tx) => {
            // Delete all existing bindings
            await tx.rolePermission.deleteMany({
                where: { roleId }
            });

            // Create new bindings
            if (permissionIds.length > 0) {
                await tx.rolePermission.createMany({
                    data: permissionIds.map(permId => ({
                        roleId,
                        permissionId: permId
                    }))
                });
            }
        });

        return NextResponse.json({ success: true, count: permissionIds.length });
    } catch (error) {
        console.error('Role Permissions POST Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
