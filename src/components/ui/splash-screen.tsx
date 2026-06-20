"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLogoIcon } from "./app-logo";

export function SplashScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 10000;
    const interval = 80;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (elapsed >= duration) {
        clearInterval(timer);
        router.replace("/login");
      }
    }, interval);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-teal-900">
      <div className="flex flex-col items-center gap-8">
        {/* Emblem */}
        <div className="relative">
          <div className="w-28 h-28 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-2">
            <AppLogoIcon size="xl" />
          </div>
          {/* Ping ring */}
          <div className="absolute inset-0 rounded-3xl bg-white/30 animate-ping" />
        </div>

        {/* Name */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">MauriRide</h1>
          <p className="text-white/70 text-base">Transport Urbain en Mauritanie</p>
          <p className="text-white/50 text-sm" dir="rtl">نقل حضري في موريتانيا</p>
        </div>

        {/* Progress bar */}
        <div className="w-56 space-y-2">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: `${progress}%`, transition: "width 80ms linear" }}
            />
          </div>
          <p className="text-white/40 text-xs text-center">
            {Math.round(progress)}%
          </p>
        </div>
      </div>

      {/* Bottom tagline */}
      <p className="absolute bottom-8 text-white/30 text-xs">
        © 2025 MauriRide — Tous droits réservés
      </p>
    </div>
  );
}
