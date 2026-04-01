import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await getRequestAuthContext(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organizationId: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const rawRole = user.role?.name || 'user';
    const normalizedRole = rawRole.toLowerCase().replace(/\s+/g, '_');

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: normalizedRole,
          organizationId: user.organizationId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error loading current user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

