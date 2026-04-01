import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';

interface AdminDashboardProps {
    data: any;
    t: any;
    money: any;
}

export default function AdminDashboard({ data, t, money }: AdminDashboardProps) {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Top Stats Cards - Flat Devex Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: t('stats.totalOrgs'), value: data.totalOrgs },
                    { label: t('stats.activeUsers'), value: data.activeUsers },
                    { label: t('stats.systemHealth'), value: data.systemAlerts.length === 0 ? t('stats.systemHealthStable') : t('stats.degraded') },
                    { label: t('stats.pendingApprovals'), value: data.pendingRequests }
                ].map((stat, i) => (
                    <Card key={i} className="bg-white border-slate-200 shadow-none rounded-none">
                        <CardContent className="p-4">
                            <p className="text-[13px] font-medium text-slate-600 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-semibold text-slate-900">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Row 1: Operational Logs and System Alerts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Card className="bg-white border-slate-200 shadow-none rounded-none overflow-hidden min-h-[350px]">
                    <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between">
                        <h3 className="text-[14px] font-bold text-slate-800">{t('sections.operationalLogs')}</h3>
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-[11px]">1 - {data.operationalLogs.length}</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.action')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.user')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.timestamp')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.status')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.operationalLogs.map((log: any) => (
                                    <TableRow key={log.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="px-4 py-2 text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">
                                            {log.workflow?.name || t('systemAction')}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-[13px] text-slate-600">
                                            {log.executedBy?.firstName} {log.executedBy?.lastName}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-[12px] text-slate-500">
                                            {format(new Date(log.createdAt), 'MM/dd/yyyy hh:mm a')}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-[12px]">
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] font-bold bg-white rounded-none ${log.status === 'success' ? 'border-emerald-200 text-emerald-600' : 'border-red-200 text-red-600'}`}
                                            >
                                                {t(`status.${log.status}`) || log.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {data.operationalLogs.length === 0 && (
                                    <TableRow><TableCell colSpan={4} className="p-8 text-center text-slate-400 italic">{t('noLogsFound')}</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-none rounded-none overflow-hidden min-h-[350px]">
                    <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between">
                        <h3 className="text-[14px] font-bold text-slate-800">{t('sections.systemAlerts')}</h3>
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-[11px]">1 - {data.systemAlerts.length}</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.severity')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.alert')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.source')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.systemAlerts.map((alert: any) => (
                                    <TableRow key={alert.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="px-4 py-2 text-[12px]">
                                            <Badge variant="outline" className="text-[10px] font-bold bg-white rounded-none border-red-200 text-red-600">
                                                {t('severity.critical')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-[13px] font-medium text-slate-800">
                                            {alert.message || t('workflowFailed', { name: alert.workflow?.name || 'Unknown' })}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-[13px] text-slate-600">{t('workflowEngine')}</TableCell>
                                    </TableRow>
                                ))}
                                {data.systemAlerts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="p-8 text-center text-emerald-600 font-medium italic">
                                            {t('allSystemsOperational')}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
