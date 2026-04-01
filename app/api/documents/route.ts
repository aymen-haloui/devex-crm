import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { checkPermission } from '@/lib/permissions';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const hasPermission = await checkPermission(user.userId, 'documents', 'read');
        if (!hasPermission) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const folderId = searchParams.get('folderId');
        const type = searchParams.get('type');

        const where: any = { organizationId: user.organizationId };
        if (folderId && folderId !== 'null') where.folderId = folderId;
        if (type) where.type = type;

        const documents = await prisma.document.findMany({
            where,
            include: {
                folder: true,
                owner: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, data: documents });
    } catch (error) {
        console.error('Documents GET Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const hasPermission = await checkPermission(user.userId, 'documents', 'create');
        if (!hasPermission) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();

        const document = await prisma.document.create({
            data: {
                organizationId: user.organizationId,
                ownerId: user.userId,
                name: body.name,
                description: body.description,
                type: body.type,
                url: body.url, // Path to the file
                sizeBytes: body.sizeBytes || 0,
                extension: body.extension,
                folderId: body.folderId || null,
                recordType: body.recordType || null,
                recordId: body.recordId || null,
            }
        });

        return NextResponse.json({ success: true, data: document });
    } catch (error) {
        console.error('Documents POST Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
