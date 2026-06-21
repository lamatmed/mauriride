import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";

export const metadata: Metadata = {
  title: {
    default: "MauriRide — Transport Urbain en Mauritanie",
    template: "%s | MauriRide",
  },
  description:
    "MauriRide — Plateforme SaaS de gestion de transport interurbain en Mauritanie",
  manifest: "/manifest.json",
  keywords: ["transport", "mauritanie", "voyageurs", "colis", "agence"],
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
