import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Palette, Check } from "lucide-react";

export const THEMES = [
  { id: "dark", name: "Cyber Lime", swatch: ["240 8% 4%", "71 87% 63%"] },
  { id: "light", name: "Clean Studio", swatch: ["40 20% 97%", "0 0% 8%"] },
  { id: "midnight", name: "Midnight Indigo", swatch: ["224 45% 6%", "190 95% 58%"] },
  { id: "noir", name: "Monochrome Noir", swatch: ["0 0% 0%", "0 0% 92%"] },
] as const;

export function ThemePalette() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  const pick = (id: string) => {
    document.documentElement.classList.add("theme-fade");
    setTheme(id);
    window.setTimeout(() => document.documentElement.classList.remove("theme-fade"), 600);
    setOpen(false);
  };

  return (
    <div className="theme-palette" ref={ref}>
      <button type="button" className="theme-trigger" aria-label="Choose theme" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Palette />
      </button>
      {open && (
        <div className="theme-menu" role="menu">
          <p className="theme-menu-label">Theme</p>
          {THEMES.map((t) => (
            <button key={t.id} type="button" role="menuitemradio" aria-checked={theme === t.id} className="theme-option" onClick={() => pick(t.id)}>
              <span className="theme-swatch" style={{ background: `linear-gradient(135deg, hsl(${t.swatch[0]}) 50%, hsl(${t.swatch[1]}) 50%)` }} />
              <span>{t.name}</span>
              {theme === t.id && <Check className="theme-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
