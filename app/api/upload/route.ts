import { NextRequest, NextResponse } from 'next/server';
import { getRequestAuthContext } from '@/lib/request-auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const auth = await getRequestAuthContext(request);
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const fileExtension = file.name.split('.').pop();
        const fileName = `${randomUUID()}.${fileExtension}`;

        // Define upload path (public/uploads)
        const uploadDir = join(process.cwd(), 'public', 'uploads');

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        const path = join(uploadDir, fileName);
        await writeFile(path, buffer);

        const fileUrl = `/uploads/${fileName}`;

        return NextResponse.json({
            success: true,
            url: fileUrl
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
