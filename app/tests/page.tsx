import { createClient } from '@/utils/supabase/server';

export default async function Page() {
  const supabase = createClient();

  return <ul>-</ul>;
}
