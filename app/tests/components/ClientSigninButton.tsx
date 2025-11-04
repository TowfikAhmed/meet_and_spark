'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Props = {
  url: string;
  anonKey: string;
};

export default function ClientSigninButton({ url, anonKey }: Props) {
  const supabase = createClient(url, anonKey);
  const [email, setEmail] = useState('valid.email@provider.io');
  const [password, setPassword] = useState('strong-password-123');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSignin = async () => {
    setLoading(true);
    setStatus('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setStatus(`Sign-in failed: ${error.message}`);
      } else {
        setStatus(`Signed in as ${data?.user?.email ?? 'unknown'}`);
      }
    } catch (err: any) {
      setStatus(`Unexpected error: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
      />
      <button className="lk-button" onClick={handleSignin} disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in with Supabase'}
      </button>
      {status && (
        <div style={{ color: status.startsWith('Signed in') ? 'green' : 'crimson' }}>{status}</div>
      )}
    </div>
  );
}
