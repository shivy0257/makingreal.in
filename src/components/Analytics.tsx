import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { GA_ID, CLARITY_ID } from "@/lib/analytics";

function loadGa(): void {
  if (!GA_ID || document.querySelector(`script[data-ga="${GA_ID}"]`)) return;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params -- gtag.js ignores plain arrays; it requires the arguments object
    window.dataLayer?.push(arguments as unknown as unknown[]);
  };
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  script.dataset.ga = GA_ID;
  document.head.appendChild(script);
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false });
}

function loadClarity(): void {
  if (!CLARITY_ID || document.querySelector(`script[data-clarity="${CLARITY_ID}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_ID)}`;
  script.dataset.clarity = CLARITY_ID;
  document.head.appendChild(script);
}

export function Analytics() {
  const { pathname } = useLocation();

  useEffect(() => {
    loadGa();
    loadClarity();
  }, []);

  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", { page_path: pathname });
  }, [pathname]);

  return null;
}
