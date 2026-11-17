import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabaseConfig";

export { isSupabaseConfigured, isPortfolioImage, portfolioImageUrl, portfolioPathFromUrl, supabaseUrl } from "@/lib/supabaseConfig";

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
