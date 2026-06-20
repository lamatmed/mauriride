import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, fmt = "dd/MM/yyyy") {
  return format(new Date(date), fmt, { locale: fr });
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: fr });
}

export function formatRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-MR", {
    style: "currency",
    currency: "MRU",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat("fr-FR").format(num);
}

export function generateTicketNumber() {
  const prefix = "TKT";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function generateTrackingNumber() {
  const prefix = "PKT";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .trim();
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export const MAURITANIAN_CITIES = [
  "Nouakchott",
  "Nouadhibou",
  "Rosso",
  "Kaédi",
  "Kiffa",
  "Néma",
  "Zouerate",
  "Tidjikja",
  "Akjoujt",
  "Aleg",
  "Sélibabi",
  "Atar",
  "Boutilimit",
  "Mbout",
  "Maghama",
  "Tintane",
  "Bassikounou",
  "Kobeni",
  "Aioun",
  "Guerou",
] as const;

export type MauritanianCity = (typeof MAURITANIAN_CITIES)[number];
