'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/nav/Sidebar';
import { BottomNav } from '@/components/nav/BottomNav';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#A4BF9D] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen pb-20 md:pb-0">
      <Sidebar />
      <BottomNav />
      <main className="flex-1 md:ml-60 p-4 sm:p-6 md:p-8 w-full max-w-[100vw] overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
