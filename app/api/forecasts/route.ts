import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { checkPermission } from '@/lib/permissions';

// Helper for BigInt serialization
const serialize = (obj: any) =>
    JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
    ));

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const hasPermission = await checkPermission(user.userId, 'forecasts', 'read');
        if (!hasPermission) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const year = searchParams.get('year');
        const period = searchParams.get('period');

        const where: any = { organizationId: user.organizationId };
        if (year) where.year = parseInt(year);
        if (period) where.period = period;

        const forecasts = await prisma.forecast.findMany({
            where,
            include: {
                targets: {
                    include: {
                        user: true,
                        role: true,
                    }
                },
            },
            orderBy: [{ year: 'desc' }, { period: 'desc' }]
        });

        return NextResponse.json({ success: true, data: serialize(forecasts) });
    } catch (error) {
        console.error('Forecasts GET Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const hasPermission = await checkPermission(user.userId, 'forecasts', 'create');
        if (!hasPermission) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();

        const forecast = await prisma.forecast.create({
            data: {
                organizationId: user.organizationId,
                name: body.name,
                type: body.type, // 'quarterly' or 'monthly'
                period: body.period,
                year: parseInt(body.year),
                basedOn: body.basedOn || 'all_deals',
                targets: {
                    create: body.targets.map((t: any) => ({
                        organizationId: user.organizationId,
                        targetValue: BigInt(t.targetValue),
                        isCompanyTarget: t.isCompanyTarget || false,
                        userId: t.userId || null,
                        roleId: t.roleId || null,
                    }))
                }
            },
            include: {
                targets: true
            }
        });

        return NextResponse.json({ success: true, data: serialize(forecast) });
    } catch (error: any) {
        console.error('Forecasts POST Error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ success: false, error: 'A forecast for this period already exists' }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
