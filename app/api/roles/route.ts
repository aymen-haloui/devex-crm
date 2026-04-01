import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const roles = await prisma.role.findMany({
            where: { organizationId: user.organizationId },
            include: {
                rolePermissions: {
                    include: { permission: true }
                },
                _count: {
                    select: { users: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ success: true, data: roles });
    } catch (error) {
        console.error('Roles GET Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        const role = await prisma.role.create({
            data: {
                name: body.name,
                description: body.description,
                organizationId: user.organizationId,
            }
        });

        // If permissions array was passed, we'd loop through and create RolePermission entries here.
        // For now, assume creation just instantiates the shell. Configuration handles permissions.

        return NextResponse.json({ success: true, data: role });
    } catch (error) {
        console.error('Roles POST Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
