import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Usually permissions are system-defined and global, so they might not have organizationId
        // If they do, fetch appropriately. For this schema, Permission has no organizationId, it's global
        const permissions = await prisma.permission.findMany({
            orderBy: { group: 'asc' }
        });

        return NextResponse.json({ success: true, data: permissions });
    } catch (error) {
        console.error('Permissions GET Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
