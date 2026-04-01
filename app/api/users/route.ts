import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const id = searchParams.get('id');

        const where: any = { organizationId: user.organizationId, isActive: true };
        if (id) {
            where.id = id;
        }
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                roleId: true,
                role: {
                    select: { name: true }
                }
            },
            orderBy: { firstName: 'asc' }
        });

        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error('Users GET Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { email, password, firstName, lastName, roleId } = body;

        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user exists within the organization
        const existingUser = await prisma.user.findUnique({
            where: {
                organizationId_email: {
                    organizationId: currentUser.organizationId,
                    email: email
                }
            }
        });

        if (existingUser) {
            return NextResponse.json({ success: false, error: 'User already exists in this organization' }, { status: 400 });
        }

        const passwordHashed = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: passwordHashed,
                firstName,
                lastName,
                organizationId: currentUser.organizationId,
                roleId: roleId || null,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                roleId: true,
                role: { select: { name: true } }
            }
        });

        return NextResponse.json({ success: true, data: newUser });
    } catch (error) {
        console.error('Users POST Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, roleId, firstName, lastName, isActive } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                roleId: roleId !== undefined ? roleId : undefined,
                firstName: firstName !== undefined ? firstName : undefined,
                lastName: lastName !== undefined ? lastName : undefined,
                isActive: isActive !== undefined ? isActive : undefined,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                roleId: true,
                role: { select: { name: true } }
            }
        });

        return NextResponse.json({ success: true, data: updatedUser });
    } catch (error) {
        console.error('Users PATCH Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
