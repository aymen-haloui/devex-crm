'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export default function CustomFieldsPage() {
    return (
        <div className="bg-white min-h-[calc(100vh-12rem)]">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center justify-between">
                    Custom Email Fields Preferences
                    <span className="text-slate-400 hover:text-indigo-600 cursor-pointer text-xs underline font-normal mt-1 block">Help</span>
                </h2>
                <p className="text-sm text-slate-600 mt-1">Choose whether you want to sync emails with external addresses stored in formulation email fields.</p>
                <p className="text-sm text-slate-600 italic mt-0.5">Applicable to records in CRM.</p>
            </div>

            <div className="mb-6">
                <div className="flex items-start gap-3">
                    <Checkbox defaultChecked className="mt-1 rounded-sm border-slate-300 data-[state=checked]:bg-indigo-600" />
                    <div>
                        <p className="text-sm font-semibold text-slate-800">By enabling custom email preferences, your organization users can:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-slate-700 marker:text-slate-400">
                            <li>View email conversations with email addresses present in custom email fields, within the email related list of the corresponding record.</li>
                            <li>Get quick suggestions from the email compose text area addresses within custom email fields when using the Send Email to receive directly in record.</li>
                            <li>Add more data to all existing email reports, source system email conversations with email addresses present in custom email fields.</li>
                            <li>Use the Email Filter list view/filter records based on the "latest email status" for email conversations with email addresses present in custom email fields.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 max-w-4xl shadow-sm text-sm text-slate-700 leading-relaxed">
                <span className="font-semibold text-slate-800">Note:</span> When this preference is disabled, email conversations with the addresses present in the custom email fields will have
                the same sharing permissions set for record's primary and secondary email addresses.
            </div>

        </div>
    );
}
