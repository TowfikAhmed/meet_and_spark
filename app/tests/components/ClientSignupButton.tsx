'use client';

import * as React from 'react';
import { createClient } from '@supabase/supabase-js';

type Props = {
  url: string;
  anonKey: string;
};

export function ClientSignupButton({ url, anonKey }: Props) {
  const [status, setStatus] = React.useState<string>('');
  const [displayName, setDisplayName] = React.useState('Demo User');
  const [email, setEmail] = React.useState('valid.email@provider.io');
  const [password, setPassword] = React.useState('strong-password-123');
  const [confirm, setConfirm] = React.useState('strong-password-123');
  const [loading, setLoading] = React.useState(false);
  const supabase = React.useMemo(() => createClient(url, anonKey), [url, anonKey]);

  async function signUpNewUser() {
    setStatus('');
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
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://example.com/welcome',
          data: { display_name: displayName },
        },
      });
      if (error) {
        setStatus(`Error: ${error.message}`);
        console.error(error);
      } else {
        const dn = data.user?.user_metadata?.display_name ?? displayName;
        setStatus(`User created: ${data.user?.email ?? 'unknown'} (${dn})`);
        console.log(data);
      }
    } catch (err: any) {
      setStatus(`Unexpected error: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
      <input
        type="text"
        placeholder="Display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
      />
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
      <input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
      />
      <button className="lk-button" onClick={signUpNewUser} disabled={loading}>
        {loading ? 'Creating…' : 'Create user'}
      </button>
      {status && (
        <div style={{ color: status.startsWith('User created') ? 'green' : 'crimson' }}>
          {status}
        </div>
      )}
    </div>
  );
}
