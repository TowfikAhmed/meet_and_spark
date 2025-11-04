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
      <img
        className=" w-screen absolute z-[-100] top-0 left-0 object-contain opacity-20"
        src="/images/bg_cover.svg"
        alt="MEET logo"
      />
      <main
        data-lk-theme="default"
        className="relative z-1 w-full max-w-6xl mx-auto h-screen flex flex-col md:flex-row items-center justify-center"
      >
        <section className="relative flex-1 flex flex-col items-center justify-center  gap-6">
          <img className="h-16" src="/images/logo.gif" alt="MEET logo" />
          <h2 className="text-dim">Business & Social Video Conferencing.</h2>
          <PageMeetingOnboarding />
        </section>
        <div className="flex-1">
          <PageClientAuthCard url={url} anonKey={anonKey} />
        </div>
      </main>
    </>
  );
}
