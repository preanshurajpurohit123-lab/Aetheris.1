import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project") || supabaseAnonKey.includes("your-anon-key")) {
    console.warn(
      "Supabase environment variables are missing or default placeholders. " +
      "Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your secrets or .env.local " +
      "to connect to your live PostgreSQL database."
    );
    return null;
  }

  if (!supabase) {
    try {
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error);
      return null;
    }
  }

  return supabase;
}

// Check if live database mode is configured and ready
export const isSupabaseConfigured = (): boolean => {
  return getSupabaseClient() !== null;
};
