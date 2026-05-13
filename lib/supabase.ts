import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client — used in Client Components
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side admin client — used in Server Components and API routes
// Uses the secret key to bypass RLS when needed
export function createAdminClient() {
  return createClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
