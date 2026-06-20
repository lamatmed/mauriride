"use client";

import { Bell, Search, PanelLeft, Sun, Moon, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import { useSidebar } from "@/lib/stores/sidebar";
import { useEffect, useState } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { toggle: toggleSidebar } = useSidebar();
  const { resolvedTheme, setTheme } = useTheme();
  const { locale, toggle: toggleLocale } = useLocale();
  const t = getT(locale);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-muted-foreground flex-shrink-0"
            title={t.common.toggleMenu}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-primary dark:text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
              document.dispatchEvent(event);
            }}
            className="hidden md:inline-flex text-muted-foreground"
            title={t.common.searchGlobal}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Language toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLocale}
            className="text-muted-foreground font-semibold text-xs w-9 h-9"
            title="Français / عربي"
          >
            {locale === "fr" ? "AR" : "FR"}
          </Button>

          {/* Theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="text-muted-foreground"
              title={resolvedTheme === "dark" ? t.common.themeLight : t.common.themeDark}
            >
              {resolvedTheme === "dark"
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />}
            </Button>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-muted-foreground relative" title={t.common.notifications}>
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full" />
          </Button>

          {actions && (
            <div className="flex items-center gap-2 border-s border-border ps-2 ms-1">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
