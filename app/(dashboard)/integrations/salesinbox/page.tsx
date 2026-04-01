"use client";
"use client";
import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function SalesInboxPage() {
  const router = useRouter();
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_INTEGRATIONS_ENABLED !== 'true') {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="p-4 flex flex-col items-center justify-center h-full">
      <h1 className="text-lg font-semibold mb-4">SalesInbox</h1>
      <div className="bg-white rounded shadow p-6 text-center">
        <div className="mb-2 text-sm font-medium">SalesInbox</div>
        <div className="mb-4 text-xs text-gray-500">This first-of-its-kind inbox will transform how you do sales. This deal-changing email organizer unites email and Devex CRM information in a single view.</div>
        <div className="flex flex-col gap-4 items-center">
          <div className="flex gap-8">
            <div className="text-xs font-semibold">PRIORITIZED IN 4-COLUMN LAYOUT</div>
            <div className="text-xs font-semibold">FILTERED WITH DEVEX CRM DATA</div>
            <div className="text-xs font-semibold">WITH ALL CONTEXTUAL DEVEX CRM INFO</div>
          </div>
          <button className="bg-green-600 text-white px-4 py-1 rounded text-xs">Configure Now</button>
        </div>
      </div>
    </div>
  );
}
