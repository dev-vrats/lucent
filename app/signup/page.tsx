'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// /signup redirects to /login — the auth page handles both tabs
export default function SignupPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/login?tab=signup');
  }, [router]);
  return null;
}
