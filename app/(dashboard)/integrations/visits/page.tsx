"use client";
"use client";
import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function VisitsPage() {
  const router = useRouter();
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_INTEGRATIONS_ENABLED !== 'true') {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="p-4 flex flex-col items-center justify-center h-full">
      <h1 className="text-lg font-semibold mb-4">Visits</h1>
      <div className="bg-white rounded shadow p-6 text-center">
        <div className="mb-2 text-sm font-medium">Visitor Tracking</div>
        <div className="mb-4 text-xs text-gray-500">Identify important prospects on your website, engage them in real time and convert them to leads—all without leaving your Devex CRM window.</div>
        <button className="bg-blue-600 text-white px-4 py-1 rounded text-xs">Get Started</button>
      </div>
    </div>
  );
}
