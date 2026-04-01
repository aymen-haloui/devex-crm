import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';

interface SupportDashboardProps {
    data: any;
    t: any;
    money: any;
}

export default function SupportDashboard({ data, t, money }: SupportDashboardProps) {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Top Stats Cards - Flat Devex Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: t('stats.unassignedCases'), value: data.openCases },
                    { label: t('stats.openHighPriority'), value: data.highPriorityCases },
                    { label: t('stats.avgResolutionTime'), value: '4.2h' }, // Keep static until history is implemented
                    { label: t('stats.customerSatisfaction'), value: '4.8/5' } // Keep static
                ].map((stat, i) => (
                    <Card key={i} className="bg-white border-slate-200 shadow-none rounded-none">
                        <CardContent className="p-4">
                            <p className="text-[13px] font-medium text-slate-600 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-semibold text-slate-900">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Row 1: Recent Support Cases and SLA Status */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Card className="bg-white border-slate-200 shadow-none rounded-none overflow-hidden min-h-[350px]">
                    <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between">
                        <h3 className="text-[14px] font-bold text-slate-800">{t('sections.recentSupportCases')}</h3>
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-[11px]">1 - {data.recentSupportCases.length}</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.caseId')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.subject')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.status')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('leads.owner')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.recentSupportCases.map((c: any) => (
                                    <TableRow key={c.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="px-4 py-2 text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">
                                            {c.caseNumber}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-[13px] text-slate-800">{c.subject}</TableCell>
                                        <TableCell className="px-4 py-2 text-[12px] text-slate-600 font-medium">
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] font-bold rounded-none px-1 h-5 ${c.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-700 border-slate-100'
                                                    }`}
                                            >
                                                {t(`status.${c.status}`) || c.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-[13px] text-slate-600">
                                            {c.owner?.firstName} {c.owner?.lastName}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {data.recentSupportCases.length === 0 && (
                                    <TableRow><TableCell colSpan={4} className="p-8 text-center text-slate-400 italic">{t('noRecentCases')}</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-none rounded-none overflow-hidden min-h-[350px]">
                    <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between">
                        <h3 className="text-[14px] font-bold text-slate-800">{t('sections.slaDistribution')}</h3>
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-[11px]">{t('next24Hours')}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.slaLevel')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.count')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.target')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { level: t('slaLevels.level1'), count: data.openCases, target: '95%' },
                                    { level: t('slaLevels.level2'), count: data.escalatedCases, target: '90%' },
                                    { level: t('slaLevels.level3'), count: data.escalatedCases > 0 ? 1 : 0, target: '100%' }
                                ].map((row, i) => (
                                    <TableRow key={i} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="px-4 py-2 text-[13px] font-medium text-slate-800">{row.level}</TableCell>
                                        <TableCell className="px-4 py-2 text-[13px] text-slate-600">{row.count}</TableCell>
                                        <TableCell className="px-4 py-2 text-[13px] text-emerald-600 font-bold">{row.target}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
