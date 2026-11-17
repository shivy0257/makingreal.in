const url = `${import.meta.env.VITE_SUPABASE_URL ?? ""}`.trim();
const anonKey = `${import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""}`.trim();

export const supabaseUrl = url;
export const supabaseAnonKey = anonKey;
export const isSupabaseConfigured = url.length > 0 && anonKey.length > 0;

const PUBLIC_OBJECT = "/storage/v1/object/public/portfolio/";

export function isPortfolioImage(url: string | null | undefined): boolean {
  if (!url || !supabaseUrl) return false;
  try {
    const parsed = new URL(url);
    return parsed.origin === new URL(supabaseUrl).origin && parsed.pathname.includes(PUBLIC_OBJECT);
  } catch {
    return false;
  }
}

export function portfolioImageUrl(url: string | null | undefined): string | null {
  return isPortfolioImage(url) ? (url as string) : null;
}

export function portfolioPathFromUrl(url: string | null | undefined): string | null {
  if (!isPortfolioImage(url)) return null;
  const index = (url as string).indexOf(PUBLIC_OBJECT);
  return decodeURIComponent((url as string).slice(index + PUBLIC_OBJECT.length).split("?")[0]);
}
