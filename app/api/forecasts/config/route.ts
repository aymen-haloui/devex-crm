import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Helper for BigInt serialization
const serialize = (obj: any) =>
    JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
    ));

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        let config = await prisma.forecastConfig.findUnique({
            where: { organizationId: user.organizationId },
        });

        if (!config) {
            config = await prisma.forecastConfig.create({
                data: {
                    organizationId: user.organizationId,
                    model: 'bottom_up',
                    hierarchyType: 'roles',
                    metric: 'revenue',
                    fiscalStartMonth: 1,
                    fiscalYearType: 'standard',
                },
            });
        }

        return NextResponse.json({ success: true, data: serialize(config) });
    } catch (error) {
        console.error('Forecasts Config GET Error:', error);
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

        const config = await prisma.forecastConfig.upsert({
            where: { organizationId: user.organizationId },
            update: {
                model: body.model,
                hierarchyType: body.hierarchyType,
                metric: body.metric,
                fiscalStartMonth: body.fiscalStartMonth,
                fiscalYearType: body.fiscalYearType,
            },
            create: {
                organizationId: user.organizationId,
                model: body.model || 'bottom_up',
                hierarchyType: body.hierarchyType || 'roles',
                metric: body.metric || 'revenue',
                fiscalStartMonth: body.fiscalStartMonth || 1,
                fiscalYearType: body.fiscalYearType || 'standard',
            },
        });

        return NextResponse.json({ success: true, data: serialize(config) });
    } catch (error) {
        console.error('Forecasts Config POST Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
