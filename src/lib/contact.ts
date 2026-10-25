const env = (import.meta.env ?? {}) as Record<string, string | undefined>;

export const CONTACT_EMAIL = env.VITE_CONTACT_EMAIL ?? "";
export const WHATSAPP_NUMBER = env.VITE_WHATSAPP_NUMBER ?? "";

export function whatsappLink(message: string): string {
  if (!WHATSAPP_NUMBER) return "#contact";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const DISPLAY_PHONE = (() => {
  if (!WHATSAPP_NUMBER) return "";
  const local = WHATSAPP_NUMBER.replace(/^91/, "");
  if (/^\d{10}$/.test(local)) return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  return `+${WHATSAPP_NUMBER}`;
})();
