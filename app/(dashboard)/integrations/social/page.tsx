"use client";
"use client";
import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function SocialPage() {
  const router = useRouter();
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_INTEGRATIONS_ENABLED !== 'true') {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="p-4 flex flex-col items-center justify-center h-full">
      <h1 className="text-lg font-semibold mb-4">Social</h1>
      <div className="bg-white rounded shadow p-6 text-center">
        <div className="mb-2 text-sm font-medium">Social Integration</div>
        <div className="mb-4 text-xs text-gray-500">Engage customers, gain valuable insights and generate leads through social media by linking your social media accounts with Devex CRM.</div>
        <button className="bg-green-600 text-white px-4 py-1 rounded text-xs">Let's Get Started</button>
      </div>
    </div>
  );
}
