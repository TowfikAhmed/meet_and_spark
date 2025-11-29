import React, { Suspense, useState } from 'react';
import PageClientAuthCard from '@/components/PageClientAuthCard';
import PageMeetingOnboarding from '@/components/PageMeetingOnboarding';
import { headers } from 'next/headers';

export default async function Page() {
  const hdrs = await headers();
  const host = hdrs.get('host') || 'localhost:3000';
  const protocol = hdrs.get('x-forwarded-proto') || (process.env.VERCEL ? 'https' : 'http');
  const apiUrl = `${protocol}://${host}/api/supabase`;

  const { url, anonKey } = await fetch(apiUrl, { cache: 'no-store' }).then((r) => r.json());

  return (
    <>
      <main
        data-lk-theme="default"
        className="relative z-1 w-full max-w-6xl mx-auto h-screen flex flex-col md:flex-row items-center justify-center"
      >
        aaaaaaa
      </main>
    </>
  );
}
