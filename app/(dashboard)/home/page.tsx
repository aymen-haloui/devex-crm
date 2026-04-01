import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PipelineFunnelChart from '@/components/dashboard/PipelineFunnelChart';
import { format } from 'date-fns';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getServerTranslations } from '@/lib/i18n-server';
import { UserRole } from '@/types';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import SalesDashboard from '@/components/dashboard/SalesDashboard';
import SupportDashboard from '@/components/dashboard/SupportDashboard';

import {
  Briefcase,
  PhoneCall,
  Users,
  Inbox,
  ArrowUpRight
} from 'lucide-react';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function monthRange(now: Date) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 });

export default async function HomePage() {
  const session = await getCurrentUser();
  const t = await getServerTranslations('home');

  if (!session) {
    return <div className="p-4">Unauthorized</div>;
  }

  const userRole = session.role as UserRole;
  const now = new Date();
  const { start: startMonth, end: endMonth } = monthRange(now);

  const openDealWhere = {
    organizationId: session.organizationId,
    deletedAt: null as null,
    stage: { notIn: ['closed_won', 'closed_lost'] },
  };

  const [
    openDeals,
    untouchedDeals,
    callsToday,
    totalLeads,
    openTasks,
    meetings,
    todaysLeads,
    closingDeals,
    pipelineDeals,
    openCases,
    escalatedCases,
    totalOrgs,
    activeUsers,
    pendingRequests,
    operationalLogs,
    systemAlerts,
    highPriorityCases,
    recentSupportCases
  ] =
    await Promise.all([
      prisma.deal.count({ where: openDealWhere }),
      prisma.deal.count({
        where: {
          ...openDealWhere,
          stage: 'prospecting',
        },
      }),
      prisma.activity.count({
        where: {
          organizationId: session.organizationId,
          deletedAt: null,
          ownerId: session.userId,
          type: 'call',
          scheduledDate: { gte: startOfToday(), lte: endOfToday() },
        },
      }),
      prisma.lead.count({
        where: {
          organizationId: session.organizationId,
          deletedAt: null,
        },
      }),
      prisma.activity.findMany({
        where: {
          organizationId: session.organizationId,
          deletedAt: null,
          ownerId: session.userId,
          type: 'task',
          status: 'open',
        },
        include: {
          owner: true,
        },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        take: 10,
      }),
      prisma.activity.findMany({
        where: {
          organizationId: session.organizationId,
          deletedAt: null,
          ownerId: session.userId,
          type: 'meeting',
          scheduledDate: { gte: now },
        },
        include: {
          owner: true,
        },
        orderBy: [{ scheduledDate: 'asc' }],
        take: 10,
      }),
      prisma.lead.findMany({
        where: {
          organizationId: session.organizationId,
          deletedAt: null,
          createdAt: { gte: startOfToday() },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.deal.findMany({
        where: {
          ...openDealWhere,
          ownerId: session.userId,
          expectedCloseDate: { gte: startMonth, lte: endMonth },
        },
        include: {
          account: true,
          owner: true,
        },
        orderBy: [{ expectedCloseDate: 'asc' }],
        take: 10,
      }),
      prisma.deal.groupBy({
        by: ['stage'],
        where: openDealWhere,
        _count: { stage: true },
        orderBy: { stage: 'asc' },
      }),
      prisma.case.count({
        where: {
          organizationId: session.organizationId,
          deletedAt: null,
          status: 'open'
        }
      }),
      prisma.case.count({
        where: {
          organizationId: session.organizationId,
          deletedAt: null,
          escalationLevel: { gt: 0 }
        }
      }),
      prisma.organization.count(),
      prisma.user.count({ where: { organizationId: session.organizationId, isActive: true, deletedAt: null } }),
      prisma.request.count({ where: { organizationId: session.organizationId, status: 'pending' } }),
      prisma.workflowExecution.findMany({
        where: { organizationId: session.organizationId },
        include: { workflow: true, executedBy: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.workflowExecution.findMany({
        where: { organizationId: session.organizationId, status: 'failed' },
        include: { workflow: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.case.count({
        where: {
          organizationId: session.organizationId,
          status: 'open',
          priority: 'high',
          deletedAt: null
        }
      }),
      prisma.case.findMany({
        where: { organizationId: session.organizationId, deletedAt: null },
        include: { owner: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

  const funnelData = pipelineDeals
    .map((row) => ({ stage: row.stage, count: row._count.stage }))
    .sort((a, b) => b.count - a.count);

  const dashboardData = {
    totalLeads,
    openDeals,
    untouchedDeals,
    callsToday,
    openTasks,
    closingDeals,
    funnelData,
    openCases,
    escalatedCases,
    meetings,
    todaysLeads,
    totalOrgs,
    activeUsers,
    pendingRequests,
    operationalLogs,
    systemAlerts,
    highPriorityCases,
    recentSupportCases
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1.5 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('greeting', { name: session.firstName || 'User' })}
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          {userRole === UserRole.ADMIN ? t('adminOverview') : t('pipelineToday')}
        </p>
      </div>

      {userRole === UserRole.ADMIN ? (
        <AdminDashboard data={dashboardData} t={t} money={money} />
      ) : userRole === UserRole.SUPPORT_AGENT ? (
        <SupportDashboard data={dashboardData} t={t} money={money} />
      ) : (
        <SalesDashboard data={dashboardData} t={t} money={money} />
      )}
    </div>
  );
}
