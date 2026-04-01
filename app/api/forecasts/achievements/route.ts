import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { checkPermission } from '@/lib/permissions';

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
        const forecastId = searchParams.get('forecastId');

        if (!forecastId) {
            return NextResponse.json({ success: false, error: 'forecastId is required' }, { status: 400 });
        }

        const forecast = await prisma.forecast.findUnique({
            where: { id: forecastId, organizationId: user.organizationId },
            include: {
                targets: {
                    include: { user: true, role: true }
                }
            }
        });

        if (!forecast) {
            return NextResponse.json({ success: false, error: 'Forecast not found' }, { status: 404 });
        }

        // Determine the date bounds for this forecast
        let startDate: Date;
        let endDate: Date;

        const y = forecast.year;
        if (forecast.period === 'Q1') { startDate = new Date(y, 0, 1); endDate = new Date(y, 3, 0); }
        else if (forecast.period === 'Q2') { startDate = new Date(y, 3, 1); endDate = new Date(y, 6, 0); }
        else if (forecast.period === 'Q3') { startDate = new Date(y, 6, 1); endDate = new Date(y, 9, 0); }
        else if (forecast.period === 'Q4') { startDate = new Date(y, 9, 1); endDate = new Date(y, 12, 0); }
        else if (forecast.period.startsWith('M')) {
            const month = parseInt(forecast.period.replace('M', '')) - 1;
            startDate = new Date(y, month, 1);
            endDate = new Date(y, month + 1, 0, 23, 59, 59);
        } else {
            startDate = new Date(y, 0, 1);
            endDate = new Date(y, 12, 0);
        }

        // Fetch all deals expected/actual in this range
        const deals = await prisma.deal.findMany({
            where: {
                organizationId: user.organizationId,
                OR: [
                    { expectedCloseDate: { gte: startDate, lte: endDate } },
                    { actualCloseDate: { gte: startDate, lte: endDate } }
                ]
            }
        });

        // Calculate aggregations
        let totalTarget = 0;
        const companyTarget = forecast.targets.find((t: any) => t.isCompanyTarget);
        if (companyTarget) totalTarget = Number(companyTarget.targetValue);

        let achieved = 0;
        let pipeline = 0;
        let weightedPipeline = 0;

        // Track user-level achievements
        const userAchievements: Record<string, { target: number, achieved: number, pipeline: number, weightedPipeline: number, userName: string }> = {};

        // Initialize targets
        forecast.targets.forEach((t: any) => {
            if (t.userId && t.user) {
                userAchievements[t.userId] = {
                    userName: `${t.user.firstName} ${t.user.lastName}`,
                    target: Number(t.targetValue),
                    achieved: 0,
                    pipeline: 0,
                    weightedPipeline: 0
                };
            }
        });

        deals.forEach((deal: any) => {
            const val = Number(deal.value);
            const prob = Number(deal.probability || 0);
            const weightedVal = (val * prob) / 100;
            const closedWon = deal.stage === 'closed_won' || deal.closedWon;
            const closedLost = deal.stage === 'closed_lost';

            if (closedWon) {
                achieved += val;
                if (userAchievements[deal.ownerId]) userAchievements[deal.ownerId].achieved += val;
            } else if (!closedLost) {
                pipeline += val;
                weightedPipeline += weightedVal;
                if (userAchievements[deal.ownerId]) {
                    userAchievements[deal.ownerId].pipeline += val;
                    userAchievements[deal.ownerId].weightedPipeline += weightedVal;
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                forecast: serialize(forecast),
                metrics: {
                    target: totalTarget,
                    achieved,
                    pipeline,
                    weightedPipeline,
                    expectedRevenue: achieved + weightedPipeline,
                    shortage: totalTarget > achieved ? totalTarget - achieved : 0,
                    userAchievements: Object.values(userAchievements)
                }
            }
        });

    } catch (error) {
        console.error('Forecasts Achievements Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
