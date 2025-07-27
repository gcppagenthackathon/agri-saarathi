
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to language selection page immediately
    router.push('/language');
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-primary p-4 text-primary-foreground">
      <div className="flex animate-pulse flex-col items-center gap-4">
        <Logo className="h-24 w-24" />
        <h1 className="text-4xl font-bold">AgriSaarathi</h1>
        <p className="text-lg">AI to the Backbone of India</p>
      </div>
    </main>
  );
}
