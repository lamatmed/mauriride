"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Building2, LogOut, Shield, Settings, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import { AppLogoIcon } from "@/components/ui/app-logo";

interface Props {
  user: { name?: string | null; email?: string | null };
}

export function SupervisorSidebar({ user }: Props) {
  const pathname = usePathname();
  const { locale, toggle: toggleLocale } = useLocale();
  const t = getT(locale);
  const s = t.supervisor;
  const isAr = locale === "ar";

  const NAV = [
    { href: "/supervisor",           icon: LayoutDashboard, label: s.nav.overview  },
    { href: "/supervisor/companies", icon: Building2,        label: s.nav.companies },
    { href: "/supervisor/settings",  icon: Settings,         label: s.nav.settings  },
  ];

  return (
    <aside
      className={cn("w-60 flex flex-col border-e bg-[#0F172A] text-slate-300 shrink-0", isAr && "border-e-0 border-s")}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="bg-white rounded-lg p-0.5 shrink-0">
          <AppLogoIcon size="sm" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">{t.common.appName}</p>
          <p className="text-[10px] text-violet-400 font-medium uppercase tracking-wider">
            {t.roles.SUPERVISEUR}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/supervisor" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 mb-2">
          <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
            <Shield className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleLocale}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Languages className="h-4 w-4 shrink-0" />
          {isAr ? "Français" : "العربية"}
        </button>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {t.common.logout}
        </button>
      </div>
    </aside>
  );
}
