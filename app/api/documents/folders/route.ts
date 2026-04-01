import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const folders = await prisma.documentFolder.findMany({
            where: { organizationId: user.organizationId },
            include: {
                _count: {
                    select: { documents: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ success: true, data: folders });
    } catch (error) {
        console.error('Folders GET Error:', error);
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

        const folder = await prisma.documentFolder.create({
            data: {
                organizationId: user.organizationId,
                ownerId: user.userId,
                name: body.name,
                description: body.description,
                isTeamFolder: body.isTeamFolder || false,
                parentId: body.parentId || null,
            }
        });

        return NextResponse.json({ success: true, data: folder });
    } catch (error) {
        console.error('Folders POST Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
