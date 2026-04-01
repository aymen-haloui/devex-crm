import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfMonth, subMonths, format } from 'date-fns';
import { getRequestAuthContext } from '@/lib/request-auth';

export async function GET(req: NextRequest) {
    try {
        const authContext = await getRequestAuthContext(req);
        if (!authContext) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { organizationId } = authContext;

        // 1. Deal Stages Data
        const dealsByStage = await prisma.deal.groupBy({
            by: ['stage'],
            where: { organizationId, deletedAt: null },
            _count: { id: true },
            _sum: { value: true },
        });

        const dealStagesData = dealsByStage.map(d => ({
            stage: d.stage,
            deals: d._count.id,
            value: d._sum.value ? Number(d._sum.value) : 0,
        }));

        // 2. Revenue Trend (last 6 months)
        const months = Array.from({ length: 6 }).map((_, i) => subMonths(startOfMonth(new Date()), i)).reverse();
        const revenueData = await Promise.all(months.map(async (month) => {
            const nextMonth = new Date(month);
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            const sum = await prisma.deal.aggregate({
                where: {
                    organizationId,
                    deletedAt: null,
                    closedWon: true,
                    actualCloseDate: {
                        gte: month,
                        lt: nextMonth,
                    },
                },
                _sum: { value: true },
            });

            return {
                month: format(month, 'MMM'),
                revenue: sum._sum.value ? Number(sum._sum.value) / 1000 : 0, // In thousands
            };
        }));

        // 3. Lead Source Data
        const leadsBySource = await prisma.lead.groupBy({
            by: ['source'],
            where: { organizationId, deletedAt: null },
            _count: { id: true },
        });

        const totalLeads = leadsBySource.reduce((acc, curr) => acc + curr._count.id, 0);
        const leadSourceData = leadsBySource.map(l => ({
            name: l.source || 'Other',
            value: totalLeads > 0 ? Math.round((l._count.id / totalLeads) * 100) : 0,
        }));

        // 4. Team Performance Data
        const teamPerformance = await prisma.user.findMany({
            where: { organizationId, isActive: true },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                deals: {
                    where: { deletedAt: null },
                    select: { value: true, closedWon: true },
                },
            },
            take: 5,
        });

        const teamPerformanceData = teamPerformance.map(user => {
            const totalDeals = user.deals.length;
            const totalValue = user.deals.reduce((acc, curr) => acc + Number(curr.value), 0);
            const closedDeals = user.deals.filter(d => d.closedWon).length;

            return {
                name: `${user.firstName} ${user.lastName}`,
                deals: totalDeals,
                value: totalValue,
                closed: closedDeals,
            };
        });

        // 5. KPI Data
        const totalPipelineSum = await prisma.deal.aggregate({
            where: { organizationId, deletedAt: null, closedWon: false },
            _sum: { value: true },
        });

        const wonDeals = await prisma.deal.count({ where: { organizationId, deletedAt: null, closedWon: true } });
        const totalDealsCount = await prisma.deal.count({ where: { organizationId, deletedAt: null } });
        const winRate = totalDealsCount > 0 ? (wonDeals / totalDealsCount) * 100 : 0;

        const avgDealSizeSum = await prisma.deal.aggregate({
            where: { organizationId, deletedAt: null },
            _avg: { value: true },
        });

        const kpiData = {
            pipeline: `$${((Number(totalPipelineSum._sum.value || 0)) / 1000).toFixed(0)}K`,
            pipelineGrowth: '↑ Updated from live data',
            winRate: `${winRate.toFixed(0)}%`,
            dealSize: `$${((Number(avgDealSizeSum._avg.value || 0)) / 1000).toFixed(0)}K`,
            dealSizeGrowth: '↑ Based on historical averages',
        };

        return NextResponse.json({
            success: true,
            data: {
                dealStagesData,
                revenueData,
                leadSourceData,
                teamPerformanceData,
                kpiData,
            },
        });
    } catch (error: any) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
