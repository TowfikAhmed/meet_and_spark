'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient, type Session } from '@supabase/supabase-js';

type Props = {
  url: string;
  anonKey: string;
};

export default function PageClientAuthCard({ url, anonKey }: Props) {
  const supabase = useMemo(() => createClient(url, anonKey), [url, anonKey]);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [displayName, setDisplayName] = useState('Demo User');
  const [email, setEmail] = useState('valid.email@provider.io');
  const [password, setPassword] = useState('strong-password-123');
  const [confirm, setConfirm] = useState('strong-password-123');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      const session = data?.session ?? null;
      if (error) setStatus(`Auth check failed: ${error.message}`);
      setUserEmail(session?.user?.email ?? null);
      setUserDisplayName((session?.user?.user_metadata as any)?.display_name ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setUserEmail(session?.user?.email ?? null);
      setUserDisplayName((session?.user?.user_metadata as any)?.display_name ?? null);
    });
    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async () => {
    setLoading(true);
    setStatus('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setStatus(`Sign-in failed: ${error.message}`);
      else setStatus(`Signed in as ${data?.user?.email ?? 'unknown'}`);
    } catch (err: any) {
      setStatus(`Unexpected error: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    setLoading(true);
    setStatus('');
    try {
      if (!displayName) {
        setStatus('Display name is required');
        return;
      }
      if (!email || !password) {
        setStatus('Email and password are required');
        return;
      }
      if (password !== confirm) {
        setStatus('Passwords do not match');
        return;
      }
      const redirectTo =
        typeof window !== 'undefined'
          ? new URL('/welcome', window.location.origin).toString()
          : undefined;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo, data: { display_name: displayName } },
      });
      if (error) setStatus(`Sign-up failed: ${error.message}`);
      else
        setStatus(
          `User created: ${data.user?.email ?? 'unknown'} (${data.user?.user_metadata?.display_name ?? displayName})`,
        );
    } catch (err: any) {
      setStatus(`Unexpected error: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setStatus('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setStatus(`Sign-out failed: ${error.message}`);
      else setStatus('Signed out');
    } catch (err: any) {
      setStatus(`Unexpected error: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[480px] mx-auto p-2"
    >
      <div className="space-y-6">
        <div>
          <div className="text-sm text-muted">{userEmail ? 'Account' : 'Welcome'}</div>
          <h2 className="mt-1 text-xl font-semibold">
            {userEmail
              ? `Signed in as ${userEmail}${userDisplayName ? ` • ${userDisplayName}` : ''}`
              : 'Sign in or create an account'}
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative inline-flex whitespace-nowrap rounded-full bg-surface-1/40 p-0.5 ring-1 ring-white/10">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={
                `relative z-10 flex-1 px-3 py-2 rounded-full text-sm font-medium transition ` +
                (mode === 'signin' ? '' : 'text-muted ')
              }
            >
              {mode === 'signin' && (
                <motion.span
                  layoutId="auth-pill"
                  className="absolute inset-0 rounded-full bg-yellow-500/20 shadow-sm"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={
                `relative z-10 flex-1 px-3 py-2 rounded-full text-sm font-medium transition ` +
                (mode === 'signup' ? 'text-primary-foreground' : 'text-muted hover:text-white')
              }
            >
              {mode === 'signup' && (
                <motion.span
                  layoutId="auth-pill"
                  className="absolute inset-0 rounded-full bg-yellow-500/20 shadow-sm"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              Sign up
            </button>
          </div>
          <button
            type="button"
            onClick={signOut}
            disabled={loading || !userEmail}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border border-white/10 text-muted hover:text-white hover:bg-surface-1/40 disabled:opacity-60"
          >
            {loading && !userEmail ? '…' : 'Sign out'}
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {mode === 'signup' ? (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-muted">Display name</label>
                <input
                  type="text"
                  placeholder="Your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-white/15 bg-transparent text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-muted">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-white/15 bg-transparent text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-muted">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-white/15 bg-transparent text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-muted">Confirm password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-white/15 bg-transparent text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent px-3 py-2"
                />
              </div>
              <button
                onClick={signUp}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-white/10 bg-yellow-500/20 text-primary-foreground shadow-sm hover:-translate-y-px hover:brightness-105 active:translate-y-0 active:brightness-95 disabled:opacity-60"
              >
                {loading ? 'Creating…' : 'Create account'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="signin"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm text-muted">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-white/15 bg-transparent text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-muted">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-white/15 bg-transparent text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent px-3 py-2"
                />
              </div>
              <button
                onClick={signIn}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-white/10 bg-yellow-500/20 text-primary-foreground shadow-sm hover:-translate-y-px hover:brightness-105 active:translate-y-0 active:brightness-95 disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {status && (
          <div
            className={
              `text-sm ` +
              (status.startsWith('Signed') || status.startsWith('User created')
                ? 'text-success'
                : 'text-danger')
            }
          >
            {status}
          </div>
        )}
      </div>
    </motion.div>
  );
}
