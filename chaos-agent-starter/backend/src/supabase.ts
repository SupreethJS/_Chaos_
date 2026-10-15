// Server-side Supabase client helper. Use only in trusted backend code.
// Add authentication verification and row-level authorization before using service-role access.
import { createClient } from '@supabase/supabase-js';

export function createServerSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server environment is not configured.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
