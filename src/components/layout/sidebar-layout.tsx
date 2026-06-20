"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/stores/sidebar";
import { Sidebar } from "./sidebar";

type CompanyInfo = { name: string; nameAr?: string | null; logo?: string | null; email?: string | null; phone?: string | null; address?: string | null } | null;

export function SidebarLayout({ children, company }: { children: React.ReactNode; company?: CompanyInfo }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex h-screen bg-muted overflow-hidden">
      <Sidebar company={company} />
      <main
        className={cn(
          "flex-1 overflow-y-auto transition-[margin] duration-300 ease-in-out",
          collapsed ? "ms-16" : "ms-64"
        )}
      >
        {children}
      </main>
    </div>
  );
}
