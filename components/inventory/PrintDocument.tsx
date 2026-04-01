import React from 'react';
import { useTranslations } from 'next-intl';
import { numberToFrenchWords } from '@/lib/currency-utils';

interface PrintDocumentProps {
    data: any;
    org: any;
    type: string;
    currencySymbol: string;
}

export const PrintDocument = ({ data, org, type, currencySymbol }: PrintDocumentProps) => {
    const isDZD = org?.currency === 'DZD';
    const t = useTranslations('inventory.common');
    const ts = useTranslations('inventory.salesOrders');

    return (
        <div className="print-document bg-white p-12 text-slate-900 font-serif w-[210mm] min-h-[297mm] mx-auto hidden print:block">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2">{org?.name || 'ESTABLISHMENT NAME'}</h1>
                    <div className="text-sm space-y-1 font-medium text-slate-600">
                        <p>{org?.address}</p>
                        <p>Tel: {org?.phone} | Email: {org?.email}</p>
                        {isDZD && (
                            <div className="grid grid-cols-2 gap-x-4 mt-4 text-[10px] uppercase font-bold text-slate-900">
                                <p>RC: {org?.rc}</p>
                                <p>NIF: {org?.nif}</p>
                                <p>AI: {org?.ai}</p>
                                <p>NIS: {org?.nis}</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-black text-slate-900 uppercase mb-1">{type}</h2>
                    <p className="text-lg font-bold text-slate-500">#{data?.number || data?.orderNumber || data?.id?.slice(-8).toUpperCase()}</p>
                    <p className="text-sm mt-4 font-bold">{t('date') || 'Date'}: {new Date(data?.date || data?.createdAt || Date.now()).toLocaleDateString(org?.locale === 'ar' ? 'ar-DZ' : 'fr-DZ')}</p>
                </div>
            </div>

            {/* Bill To / Ship To */}
            <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('billTo') || 'Bill To'}</h3>
                    <p className="text-lg font-bold">{data?.vendor?.name || data?.contact?.firstName + (data?.contact?.lastName ? ' ' + data?.contact?.lastName : '') || data?.account?.name || 'Client Name'}</p>
                    <p className="text-sm text-slate-600">{data?.vendor?.address || data?.billingAddress?.street || 'Client Address'}</p>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-12">
                <thead>
                    <tr className="border-b-2 border-slate-900 text-left text-[10px] uppercase font-black tracking-widest text-slate-500">
                        <th className="py-3 px-2">{t('description') || 'Description'}</th>
                        <th className="py-3 px-2 text-right">{t('qty') || 'Qty'}</th>
                        <th className="py-3 px-2 text-right">{t('price') || 'Price'}</th>
                        <th className="py-3 px-2 text-right">{t('tax') || 'Tax'}</th>
                        <th className="py-3 px-2 text-right">{t('total') || 'Total'}</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.lineItems?.map((item: any, idx: number) => (
                        <tr key={idx} className="border-b border-slate-100 text-sm">
                            <td className="py-4 px-2 font-bold">{item.productName || item.product?.name || 'Product'}</td>
                            <td className="py-4 px-2 text-right">{item.quantity}</td>
                            <td className="py-4 px-2 text-right">{currencySymbol} {item.listPrice?.toLocaleString()}</td>
                            <td className="py-4 px-2 text-right">{item.tax}%</td>
                            <td className="py-4 px-2 text-right font-black">{currencySymbol} {item.total?.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-12">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-bold text-slate-500">{t('subTotal') || 'HT (Subtotal)'}</span>
                        <span className="font-black">{currencySymbol} {data?.subTotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="font-bold text-slate-500">{t('tax') || 'TVA (Tax)'}</span>
                        <span className="font-black">{currencySymbol} {data?.tax?.toLocaleString()}</span>
                    </div>
                    {data?.discount > 0 && (
                        <div className="flex justify-between text-sm text-rose-600">
                            <span className="font-bold uppercase">{t('discount') || 'Remise'}</span>
                            <span className="font-black">-{currencySymbol} {data?.discount?.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center">
                        <span className="text-lg font-black uppercase">{t('total') || 'Total TTC'}</span>
                        <span className="text-xl font-black">{currencySymbol} {data?.grandTotal?.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Legal Word Amount */}
            {isDZD && (
                <div className="p-6 bg-slate-50 rounded-xl mb-12 border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 italic">
                        {t('legal.amountInWordsPrefix') || 'Arrêté la présente ' + type.toLowerCase() + ' à la somme de :'}
                    </p>
                    <p className="text-sm font-black italic">"{numberToFrenchWords(data?.grandTotal || 0)} {t('legal.amountInWordsSuffix') || 'dinars algériens'}"</p>
                </div>
            )}

            {/* Footer / Stamps */}
            <div className="mt-auto grid grid-cols-2 gap-12 text-center pt-20">
                <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-24">{t('legal.ackReceipt') || 'Accusé de réception'}</p>
                    <div className="border-t border-slate-200 pt-2 text-[10px] text-slate-400 uppercase font-bold">{t('legal.signDate') || 'Signature & Date'}</div>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-24">{t('legal.stampSign') || 'Cachet et Signature'}</p>
                    <div className="border-t border-slate-200 pt-2 text-[10px] text-slate-400 uppercase font-bold">{t('legal.signStamp') || 'Signature & Stamp'}</div>
                </div>
            </div>
        </div>
    );
};
