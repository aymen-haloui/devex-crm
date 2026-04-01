'use client';

import React from 'react';
import {
    MoreHorizontal,
    Trash2,
    Edit,
    Mail,
    Download,
    FileText,
    Printer,
    Database,
    RefreshCcw,
    CheckCircle2,
    Copy,
    Share2,
    Sparkles
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

import { useTranslations } from 'next-intl';

interface MassActionsMenuProps {
    entity: string;
    selectedCount: number;
    entityType?: 'leads' | 'contacts' | 'accounts' | 'deals';
    onAction?: (action: string) => void;
}

export default function MassActionsMenu({ entity, entityType, selectedCount, onAction }: MassActionsMenuProps) {
    const t = useTranslations('common.mass_actions');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 w-9 p-0 border-slate-200 bg-white hover:bg-slate-50 shadow-sm"
                  disabled={selectedCount === 0}
                  title={selectedCount === 0 ? 'Select items first' : undefined}
                >
                    <MoreHorizontal className="h-4 w-4 text-slate-600" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px] shadow-xl border-slate-200 rounded-lg p-1">
                {selectedCount > 0 && (
                    <>
                        <DropdownMenuLabel className="text-[11px] font-bold text-slate-400 uppercase px-2 py-1.5">
                            {t('title')} ({selectedCount})
                        </DropdownMenuLabel>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer py-2 focus:bg-rose-50 focus:text-rose-600" onClick={() => onAction?.('mass_delete')}>
                            <Trash2 className="h-4 w-4" />
                            <span className="text-[13px] font-medium">{t('mass_delete')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer py-2" onClick={() => onAction?.('mass_update')}>
                            <RefreshCcw className="h-4 w-4" />
                            <span className="text-[13px] font-medium">{t('mass_update')}</span>
                        </DropdownMenuItem>
                        {entityType === 'leads' && (
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer py-2" onClick={() => onAction?.('mass_convert')}>
                                <RefreshCcw className="h-4 w-4" />
                                <span className="text-[13px] font-medium">{t('mass_convert')}</span>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer py-2" onClick={() => onAction?.('mass_email')}>
                            <Mail className="h-4 w-4" />
                            <span className="text-[13px] font-medium">{t('mass_email')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-100" />
                    </>
                )}

                <DropdownMenuLabel className="text-[11px] font-bold text-slate-400 uppercase px-2 py-1.5">
                    {t('toolbox')}
                </DropdownMenuLabel>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer py-2" onClick={() => onAction?.('manage_tags')}>
                    <Database className="h-4 w-4" />
                    <span className="text-[13px] font-medium">{t('manage_tags')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer py-2" onClick={() => onAction?.('approve')}>
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-[13px] font-medium">{t('approve', { entity })}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer py-2" onClick={() => onAction?.('deduplicate')}>
                    <Copy className="h-4 w-4" />
                    <span className="text-[13px] font-medium">{t('deduplicate', { entity })}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer py-2" onClick={() => onAction?.('add_to_campaign')}>
                    <Share2 className="h-4 w-4" />
                    <span className="text-[13px] font-medium">{t('add_to_campaign')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer py-2" onClick={() => onAction?.('export')}>
                    <Download className="h-4 w-4" />
                    <span className="text-[13px] font-medium">{t('export_entity', { entity })}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-100" />

                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer py-2" onClick={() => onAction?.('print_view')}>
                    <Printer className="h-4 w-4" />
                    <span className="text-[13px] font-medium">{t('print_view')} ✨</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
