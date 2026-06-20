"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard, Ticket, Users, Bus, MapPin, Package,
  Luggage, DollarSign, BarChart3, Building2, UserCog,
  Settings, Zap, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const commands = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard, group: "Navigation" },
  { label: "Nouvelles réservations", href: "/reservations/new", icon: Ticket, group: "Actions rapides" },
  { label: "Réservations", href: "/reservations", icon: Ticket, group: "Navigation" },
  { label: "Voyageurs", href: "/passengers", icon: Users, group: "Navigation" },
  { label: "Trajets", href: "/trips", icon: MapPin, group: "Navigation" },
  { label: "Embarquement", href: "/boarding", icon: Zap, group: "Navigation" },
  { label: "Colis", href: "/parcels", icon: Package, group: "Navigation" },
  { label: "Nouveau colis", href: "/parcels/new", icon: Package, group: "Actions rapides" },
  { label: "Bagages", href: "/baggage", icon: Luggage, group: "Navigation" },
  { label: "Bus", href: "/buses", icon: Bus, group: "Navigation" },
  { label: "Finances", href: "/finance", icon: DollarSign, group: "Navigation" },
  { label: "Rapports", href: "/reports", icon: BarChart3, group: "Navigation" },
  { label: "Agences", href: "/agencies", icon: Building2, group: "Navigation" },
  { label: "Utilisateurs", href: "/users", icon: UserCog, group: "Navigation" },
  { label: "Paramètres", href: "/settings", icon: Settings, group: "Navigation" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleOpen = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (href: string) => {
    router.push(href);
    setOpen(false);
    setSearch("");
  };

  const groups = Array.from(new Set(commands.map((c) => c.group)));

  if (!open) return null;

  return (
    <div className="cmdk-overlay" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="cmdk-dialog animate-slide-up max-w-2xl">
        <Command className="flex flex-col" shouldFilter>
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Rechercher... (Ctrl+K)"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 text-xs bg-muted border border-border rounded px-1.5 py-0.5 text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <Command.List className="max-h-80 overflow-y-auto custom-scrollbar p-2">
            <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
              Aucun résultat pour &quot;{search}&quot;
            </Command.Empty>

            {groups.map((group) => (
              <Command.Group
                key={group}
                heading={group}
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
              >
                {commands
                  .filter((c) => c.group === group)
                  .map((cmd) => {
                    const Icon = cmd.icon;
                    return (
                      <Command.Item
                        key={cmd.href}
                        value={cmd.label}
                        onSelect={() => handleSelect(cmd.href)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors",
                          "data-[selected=true]:bg-muted data-[selected=true]:text-foreground",
                          "hover:bg-muted"
                        )}
                      >
                        <div className="w-7 h-7 rounded-md bg-primary/5 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="font-medium">{cmd.label}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{cmd.href}</span>
                      </Command.Item>
                    );
                  })}
              </Command.Group>
            ))}
          </Command.List>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="bg-muted border border-border rounded px-1 py-0.5">↑↓</kbd>
              naviguer
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-muted border border-border rounded px-1 py-0.5">↵</kbd>
              ouvrir
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-muted border border-border rounded px-1 py-0.5">ESC</kbd>
              fermer
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
