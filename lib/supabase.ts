import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Uses cookies (not localStorage) so the proxy can read the session server-side
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
