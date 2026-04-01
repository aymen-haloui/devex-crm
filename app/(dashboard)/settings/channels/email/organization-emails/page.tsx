'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export default function OrganizationEmailsPage() {
    return (
        <div className="bg-white min-h-[calc(100vh-12rem)]">
            <div className="mb-6 flex items-start justify-between">
                <div className="max-w-4xl">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        Organization Email Addresses
                        <span className="text-slate-400 hover:text-indigo-600 cursor-pointer text-xs underline font-normal mt-1 block mb-0">Help</span>
                    </h2>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                        Add the email addresses of your various departments from which you send and receive customer emails. You can use these addresses as the "From" and "Reply To" addresses. The email addresses have to be verified before you can use them.
                    </p>
                </div>
            </div>

            <Button className="bg-[#4169E1] hover:bg-blue-700 text-white rounded text-sm px-6 font-semibold shadow-sm h-8 relative mt-2">
                Add Email Address
            </Button>
        </div>
    );
}
