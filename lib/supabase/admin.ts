import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVICE ROLE KEY -- SERVER-ONLY. Never import this file from a Client Component
// or anything that ends up in the browser bundle. Bypasses all RLS.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
