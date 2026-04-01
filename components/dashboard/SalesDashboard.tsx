import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PipelineFunnelChart from '@/components/dashboard/PipelineFunnelChart';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';

interface SalesDashboardProps {
    data: any;
    t: any;
    money: any;
}

export default function SalesDashboard({ data, t, money }: SalesDashboardProps) {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Top Stats Cards - Flat Devex Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: t('openDeals'), value: data.openDeals },
                    { label: t('untouchedDeals'), value: data.untouchedDeals },
                    { label: t('callsToday'), value: data.callsToday },
                    { label: t('totalLeads'), value: data.totalLeads }
                ].map((stat, i) => (
                    <Card key={i} className="bg-white border-slate-200 shadow-none rounded-none">
                        <CardContent className="p-4">
                            <p className="text-[13px] font-medium text-slate-600 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-semibold text-slate-900">{stat.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Row 1: Tasks and Meetings */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Card className="bg-white border-slate-200 shadow-none rounded-none overflow-hidden min-h-[350px]">
                    <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between">
                        <h3 className="text-[14px] font-bold text-slate-800">{t('sections.myOpenTasks')}</h3>
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-[11px]">1 - 10</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.subject')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.dueDate')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.status')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.priority')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.relatedTo')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.contactName')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.openTasks.map((task: any) => (
                                    <TableRow key={task.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="px-4 py-2 text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">{task.subject || task.title}</TableCell>
                                        <TableCell className="px-4 py-2 text-[12px] text-slate-500">{task.dueDate ? format(new Date(task.dueDate), 'MM/dd/yyyy') : '-'}</TableCell>
                                        <TableCell className="px-4 py-2 text-[12px] text-slate-600">{task.status}</TableCell>
                                        <TableCell className="px-4 py-2 text-[12px] text-slate-600">{task.priority}</TableCell>
                                        <TableCell className="px-4 py-2 text-[13px] text-blue-600 hover:underline cursor-pointer">{task.relatedToName || '-'}</TableCell>
                                        <TableCell className="px-4 py-2 text-[13px] text-slate-800 flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">
                                                {task.owner?.firstName?.[0] || 'U'}
                                            </div>
                                            {task.owner?.firstName} {task.owner?.lastName}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {data.openTasks.length === 0 && (
                                    <TableRow><TableCell colSpan={6} className="p-8 text-center text-slate-400 text-sm italic">{t('noOpenTasks')}</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-none rounded-none overflow-hidden min-h-[350px]">
                    <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between">
                        <h3 className="text-[14px] font-bold text-slate-800">{t('sections.myMeetings')}</h3>
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-[11px]">1 - 5</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.subject')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.start')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.end')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.relatedTo')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.contactName')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.meetings.map((meeting: any) => (
                                    <TableRow key={meeting.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="px-4 py-2 text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">{meeting.title}</TableCell>
                                        <TableCell className="px-4 py-2 text-[12px] text-slate-500">{meeting.scheduledDate ? format(new Date(meeting.scheduledDate), 'MM/dd/yyyy hh:mm a') : '-'}</TableCell>
                                        <TableCell className="px-4 py-2 text-[12px] text-slate-500">{meeting.dueDate ? format(new Date(meeting.dueDate), 'MM/dd/yyyy hh:mm a') : '-'}</TableCell>
                                        <TableCell className="px-4 py-2 text-[13px] text-blue-600 hover:underline cursor-pointer">{meeting.relatedToName || '-'}</TableCell>
                                        <TableCell className="px-4 py-2 text-[13px] text-slate-800 flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">
                                                {meeting.owner?.firstName?.[0] || 'U'}
                                            </div>
                                            {meeting.owner?.firstName} {meeting.owner?.lastName}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {data.meetings.length === 0 && (
                                    <TableRow><TableCell colSpan={5} className="p-8 text-center text-slate-400 text-sm italic">{t('noUpcomingMeetings')}</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Row 2: Leads and Deals */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Card className="bg-white border-slate-200 shadow-none rounded-none overflow-hidden min-h-[350px]">
                    <CardHeader className="p-3 border-b border-slate-100">
                        <h3 className="text-[14px] font-bold text-slate-800">{t('sections.todaysLeads')}</h3>
                    </CardHeader>
                    <CardContent className="p-0">
                        {data.todaysLeads.length > 0 ? (
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="hover:bg-transparent border-slate-100">
                                        <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.leadName')}</TableHead>
                                        <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.company')}</TableHead>
                                        <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.email')}</TableHead>
                                        <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.status')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.todaysLeads.map((lead: any) => (
                                        <TableRow key={lead.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="px-4 py-2 text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">{lead.firstName} {lead.lastName}</TableCell>
                                            <TableCell className="px-4 py-2 text-[13px] text-slate-600">{lead.company || t('noCompany')}</TableCell>
                                            <TableCell className="px-4 py-2 text-[13px] text-slate-500">{lead.email}</TableCell>
                                            <TableCell className="px-4 py-2 text-[12px]"><Badge variant="outline" className="text-[10px] font-bold bg-white rounded-none border-slate-200">{lead.status}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                                <p className="text-[13px] font-medium italic">{t('noLeadsFound')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-none rounded-none overflow-hidden min-h-[350px]">
                    <CardHeader className="p-3 border-b border-slate-100 flex flex-row items-center justify-between">
                        <h3 className="text-[14px] font-bold text-slate-800">{t('sections.closingThisMonth')}</h3>
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-[11px]">1 - 10</span>
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.dealName')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.amount')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.stage')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.closingDate')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.relatedTo')}</TableHead>
                                    <TableHead className="h-8 px-4 text-[11px] font-bold text-slate-500 uppercase">{t('table.dealOwner')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.closingDeals.map((deal: any) => (
                                    <TableRow key={deal.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="px-4 py-2 text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">{deal.name}</TableCell>
                                        <TableCell className="px-4 py-2 text-[13px] font-bold text-slate-800">{money.format(Number(deal.value))}</TableCell>
                                        <TableCell className="px-4 py-2 text-[12px] text-slate-600">{t(`stages.${deal.stage}`) || deal.stage}</TableCell>
                                        <TableCell className="px-4 py-2 text-[12px] text-slate-500">{deal.expectedCloseDate ? format(new Date(deal.expectedCloseDate), 'MM/dd/yyyy') : '-'}</TableCell>
                                        <TableCell className="px-4 py-2 text-[13px] text-blue-600 hover:underline cursor-pointer">{deal.account?.name || '-'}</TableCell>
                                        <TableCell className="px-4 py-2 text-[13px] text-slate-800 flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">
                                                {deal.owner?.firstName?.[0] || 'U'}
                                            </div>
                                            {deal.owner?.firstName} {deal.owner?.lastName}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {data.closingDeals.length === 0 && (
                                    <TableRow><TableCell colSpan={6} className="p-8 text-center text-slate-400 text-sm italic">{t('noDealsClosing')}</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Row 3: Funnel */}
            <Card className="bg-white border-slate-200 shadow-none rounded-none overflow-hidden">
                <CardHeader className="p-3 border-b border-slate-100">
                    <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-tight">{t('sections.myPipeline')}</h3>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="h-[250px] w-full max-w-xl mx-auto">
                        <PipelineFunnelChart data={data.funnelData} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
