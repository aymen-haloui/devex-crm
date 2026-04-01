import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const serialize = (obj: any) =>
    JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
    ));

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { forecastId, targets } = body;

        if (!forecastId || !targets || !Array.isArray(targets)) {
            return NextResponse.json({ success: false, error: 'Invalid Payload' }, { status: 400 });
        }

        // Completely replace targets for this forecast
        // A bit destructive, but works for setting the hierarchy in one swoop
        await prisma.forecastTarget.deleteMany({
            where: { forecastId, organizationId: user.organizationId }
        });

        const createdTargets = await prisma.forecastTarget.createMany({
            data: targets.map((t: any) => ({
                organizationId: user.organizationId,
                forecastId,
                targetValue: BigInt(t.targetValue),
                isCompanyTarget: t.isCompanyTarget || false,
                userId: t.userId || null,
                roleId: t.roleId || null,
            }))
        });

        return NextResponse.json({ success: true, count: createdTargets.count });
    } catch (error) {
        console.error('Forecasts Targets POST Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
