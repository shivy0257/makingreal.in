import { useTheme } from "next-themes";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Palette, Check } from "lucide-react";

const THEMES = [
  { id: "dark", name: "Cyber Lime" },
  { id: "light", name: "Clean Studio" },
  { id: "midnight", name: "Midnight Indigo" },
  { id: "noir", name: "Monochrome Noir" },
] as const;

export function ThemePalette() {
  const { theme, setTheme } = useTheme();
  return <DropdownMenu.Root modal={false}>
    <DropdownMenu.Trigger asChild>
      <button type="button" className="theme-trigger icon-button" aria-label="Choose theme"><Palette aria-hidden="true" /></button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content className="theme-menu glass" align="end" sideOffset={12} collisionPadding={16}>
        <DropdownMenu.Label className="theme-menu-label">Choose your atmosphere</DropdownMenu.Label>
        <DropdownMenu.RadioGroup value={theme} onValueChange={setTheme}>
          {THEMES.map(item => <DropdownMenu.RadioItem key={item.id} value={item.id} className="theme-option">
            <span className={`theme-swatch swatch-${item.id}`} aria-hidden="true" />
            <span>{item.name}</span>
            <DropdownMenu.ItemIndicator className="theme-check"><Check aria-hidden="true" /></DropdownMenu.ItemIndicator>
          </DropdownMenu.RadioItem>)}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>;
}
