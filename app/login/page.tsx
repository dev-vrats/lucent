'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

function getFirebaseErrorMessage(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use':    'An account with this email already exists.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/weak-password':           'Password must be at least 6 characters.',
    'auth/user-not-found':          'No account found with this email.',
    'auth/wrong-password':          'Incorrect password. Try again.',
    'auth/too-many-requests':       'Too many attempts. Please wait a moment.',
    'auth/popup-closed-by-user':    'Sign-in was cancelled.',
    'auth/network-request-failed':  'Network error. Check your connection.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

type Tab = 'signin' | 'signup';

function AuthPageInner() {
  const [tab, setTab]         = useState<Tab>('signin');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailError, setEmailError]     = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { user, loading: authLoading, login, signup, loginWithGoogle } = useAuth();
  const router     = useRouter();
  const params     = useSearchParams();
  const returnTo   = params.get('from') || '/dashboard';

  useEffect(() => {
    if (params.get('tab') === 'signup') setTab('signup');
  }, [params]);

  useEffect(() => {
    if (!authLoading && user) router.replace(returnTo);
  }, [user, authLoading, router, returnTo]);

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    if (!email.includes('@')) { setEmailError('Enter a valid email.'); valid = false; }
    if (password.length < 6)   { setPasswordError('At least 6 characters.'); valid = false; }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (tab === 'signin') await login(email, password);
      else                  await signup(email, password);
      toast.success(tab === 'signin' ? 'Welcome back!' : 'Account created!');
      router.push(returnTo);
    } catch (err: any) {
      const msg = getFirebaseErrorMessage(err.code);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome!');
      router.push(returnTo);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(getFirebaseErrorMessage(err.code));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#5E7A76] hover:text-[#93AFA8] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Lucent
        </Link>

        {/* Card */}
        <motion.div
          className="glass-card p-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#A4BF9D] flex items-center justify-center">
              <span className="text-[#071A1F] font-bold font-mono">L</span>
            </div>
            <span className="font-display text-xl font-semibold">Lucent</span>
          </div>

          {/* Tab toggle */}
          <div className="flex gap-1 p-1 bg-[rgba(164,191,157,0.06)] rounded-xl mb-6">
            {(['signin', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === t
                    ? 'bg-[#0F2E36] text-[#EAF3F0] shadow-sm'
                    : 'text-[#5E7A76] hover:text-[#93AFA8]'
                }`}
              >
                {t === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === 'signin' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === 'signin' ? 10 : -10 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  id="email"
                  type="email"
                  label="Email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={emailError}
                  autoComplete="email"
                />

                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    label="Password"
                    placeholder={tab === 'signup' ? 'At least 6 characters' : '••••••••'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={passwordError}
                    autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 bottom-2.5 text-[#5E7A76] hover:text-[#93AFA8]"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Button type="submit" className="w-full" loading={loading} size="lg">
                  <Mail className="w-4 h-4" />
                  {tab === 'signin' ? 'Sign in with email' : 'Create account'}
                </Button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[rgba(164,191,157,0.12)]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-xs text-[#5E7A76] bg-[rgba(15,46,54,0.55)]">or</span>
                </div>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                size="lg"
                onClick={handleGoogle}
                loading={googleLoading}
              >
                <GoogleIcon />
                Continue with Google
              </Button>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-xs text-[#5E7A76]">
          AI scoring is decision support — you make the call.
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 rounded-full border-2 border-[#A4BF9D] border-t-transparent animate-spin" /></div>}>
      <AuthPageInner />
    </Suspense>
  );
}
