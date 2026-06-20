"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Ticket, Users, Bus, MapPin, Package,
  Luggage, DollarSign, BarChart3, Building2, UserCog,
  Settings, LogOut, Zap, PanelLeftOpen,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useSidebar } from "@/lib/stores/sidebar";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import { AppLogoIcon } from "@/components/ui/app-logo";
import type { UserRole } from "@prisma/client";

interface NavItem {
  key: keyof ReturnType<typeof getT>["nav"];
  href: string;
  icon: React.ReactNode;
  badge?: number;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { key: "dashboard",    href: "/dashboard",    icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: "reservations", href: "/reservations", icon: <Ticket className="h-4 w-4" /> },
  { key: "passengers",   href: "/passengers",   icon: <Users className="h-4 w-4" /> },
  { key: "trips",        href: "/trips",        icon: <MapPin className="h-4 w-4" /> },
  { key: "boarding",     href: "/boarding",     icon: <Zap className="h-4 w-4" /> },
  { key: "parcels",      href: "/parcels",      icon: <Package className="h-4 w-4" /> },
  { key: "baggage",      href: "/baggage",      icon: <Luggage className="h-4 w-4" /> },
  { key: "buses",        href: "/buses",        icon: <Bus className="h-4 w-4" />,        roles: ["SUPER_ADMIN", "DIRECTOR", "AGENCY_MANAGER"] as UserRole[] },
  { key: "finance",      href: "/finance",      icon: <DollarSign className="h-4 w-4" />, roles: ["SUPER_ADMIN", "DIRECTOR", "AGENCY_MANAGER", "CASHIER"] as UserRole[] },
  { key: "reports",      href: "/reports",      icon: <BarChart3 className="h-4 w-4" />,  roles: ["SUPER_ADMIN", "DIRECTOR", "AGENCY_MANAGER"] as UserRole[] },
  { key: "agencies",     href: "/agencies",     icon: <Building2 className="h-4 w-4" />,  roles: ["SUPER_ADMIN", "DIRECTOR"] as UserRole[] },
  { key: "users",        href: "/users",        icon: <UserCog className="h-4 w-4" />,    roles: ["SUPER_ADMIN", "DIRECTOR", "AGENCY_MANAGER"] as UserRole[] },
  { key: "settings",     href: "/settings",     icon: <Settings className="h-4 w-4" /> },
];

function NavLink({
  item, pathname, collapsed, label,
}: {
  item: NavItem; pathname: string; collapsed: boolean; label: string;
}) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  return (
    <Link
      href={item.href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
        collapsed && "justify-center px-2",
        isActive
          ? "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500/30"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
      )}
    >
      <span className={cn(
        "flex-shrink-0",
        isActive
          ? "text-teal-600 dark:text-teal-400"
          : "text-slate-400 dark:text-slate-500"
      )}>
        {item.icon}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && item.badge && (
        <span className="ms-auto bg-teal-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

type CompanyInfo = { name: string; nameAr?: string | null; logo?: string | null; email?: string | null; phone?: string | null; address?: string | null } | null;

export function Sidebar({ company }: { company?: CompanyInfo }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { collapsed, toggle } = useSidebar();
  const { locale } = useLocale();
  const t = getT(locale);

  const userRole = session?.user?.role as UserRole | undefined;
  const visibleItems = navItems.filter(
    (item) => !item.roles || !userRole || item.roles.includes(userRole)
  );

  return (
    <aside className={cn("sidebar custom-scrollbar overflow-y-auto", collapsed ? "w-16" : "w-64")}>
      {/* Logo */}
      <div className={cn(
        "flex items-center px-4 py-5 border-b border-slate-100 dark:border-white/[0.08]",
        collapsed ? "justify-center" : "gap-3"
      )}>
        {company?.logo ? (
          <img
            src={company.logo}
            alt={company.name}
            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <AppLogoIcon size="sm" />
        )}
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
              {company
                ? (locale === "ar" && company.nameAr ? company.nameAr : company.name)
                : t.common.appName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
              {t.common.appName}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            collapsed={collapsed}
            label={t.nav[item.key]}
          />
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-slate-100 dark:border-white/[0.08]">
        {!collapsed && session?.user && (
          <div className="mb-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/5">
            <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{session.user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session.user.email}</p>
            {userRole && (
              <span className="mt-1 inline-flex text-xs bg-teal-50 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400 px-2 py-0.5 rounded-full">
                {(t.roles as Record<string, string>)[userRole] ?? userRole}
              </span>
            )}
          </div>
        )}

        {collapsed && (
          <button
            type="button"
            onClick={toggle}
            title="Agrandir le menu"
            className="w-full flex justify-center py-2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white transition-colors"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={t.common.logout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
            "text-slate-500 hover:bg-red-50 hover:text-red-600",
            "dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-red-400",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>{t.common.logout}</span>}
        </button>
      </div>
    </aside>
  );
}
