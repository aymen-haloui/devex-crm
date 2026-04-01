import { NextRequest, NextResponse } from 'next/server';
import { checkPermission } from '@/lib/permissions';
import { getRequestAuthContext } from '@/lib/request-auth';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const allowed = await checkPermission(auth.userId, 'campaigns', 'edit');
    if (!allowed) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', auth.organizationId);
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '.png';
    const filename = `email_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    const url = `/uploads/${auth.organizationId}/${filename}`;
    return NextResponse.json({ success: true, data: { url } });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
