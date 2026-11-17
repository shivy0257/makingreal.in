export const GA_ID = import.meta.env.VITE_GA_ID || "G-6L5S4NB9P6";
export const CLARITY_ID = import.meta.env.VITE_CLARITY_ID || "z68ktdr7lz";

type EventParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(name: string, params?: EventParams): void {
  try {
    if (typeof window.gtag === "function") window.gtag("event", name, params);
    if (typeof window.clarity === "function") window.clarity("event", name);
  } catch {
    // analytics must never break the page
  }
}
