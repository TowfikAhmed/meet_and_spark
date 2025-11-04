import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { ClientSignupButton } from './components/ClientSignupButton';
import ClientSigninButton from './components/ClientSigninButton';
import ClientAuthStatus from './components/ClientAuthStatus';

export default async function Page() {
  const hdrs = await headers();
  const host = hdrs.get('host') || 'localhost:3000';
  const protocol = hdrs.get('x-forwarded-proto') || (process.env.VERCEL ? 'https' : 'http');
  const apiUrl = `${protocol}://${host}/api/supabase`;

  const { url, anonKey } = await fetch(apiUrl, { cache: 'no-store' }).then((r) => r.json());

  const supabase = createClient(url, anonKey);

  const { data: todos } = await supabase.from('instruments').select();

  return (
    <div>
      <h1>Todos</h1>
      <ul>
        {todos?.map((t, idx) => (
          <li key={t.id ?? idx}>{t.title ?? JSON.stringify(t)}</li>
        ))}
      </ul>
      <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <ClientSignupButton url={url} anonKey={anonKey} />
        <ClientSigninButton url={url} anonKey={anonKey} />
        <ClientAuthStatus url={url} anonKey={anonKey} />
      </div>
    </div>
  );
}
