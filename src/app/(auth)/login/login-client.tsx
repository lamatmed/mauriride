"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Languages, ArrowRight, ArrowLeft } from "lucide-react";
import { AppLogoBrand } from "@/components/ui/app-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const schemaFr = z.object({
  email:    z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

const schemaAr = z.object({
  email:    z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginForm = z.infer<typeof schemaFr>;

interface Props {
  agencyCount: number;
  companyCount: number;
}

export function LoginClient({ agencyCount, companyCount }: Props) {
  const { locale, toggle: toggleLocale } = useLocale();
  const t       = getT(locale).auth;
  const tCommon = getT(locale).common;
  const isAr    = locale === "ar";

  const [view, setView]               = useState<"brand" | "form">("brand");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [isLoading, setIsLoading]       = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(isAr ? schemaAr : schemaFr),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email:    data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setError(t.wrongCredentials);
        setIsLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError(t.errorOccurred);
      setIsLoading(false);
    }
  };

  const stats = [
    { value: String(agencyCount), label: t.agencies        },
    { value: "200+",              label: t.dailyPassengers },
    { value: String(companyCount),label: t.companies       },
  ];

  /* slide direction: LTR exits left / RTL exits right */
  const brandExit = isAr ? "translate-x-full"  : "-translate-x-full";
  const formEnter = isAr ? "-translate-x-full" : "translate-x-full";

  return (
    <div className="relative h-screen overflow-hidden">

      {/* ═══════════════════════════════════════════
          PANNEAU 1 — Branding
      ═══════════════════════════════════════════ */}
      <div
        dir={isAr ? "rtl" : "ltr"}
        className={cn(
          "absolute inset-0 flex flex-col login-brand-panel transition-transform duration-700 ease-in-out",
          view === "form" ? brandExit : "translate-x-0"
        )}
      >
        {/* Aurora orbs */}
        <div className="absolute top-[-15%] left-[-5%] w-[600px] h-[600px] rounded-full bg-teal-500/20 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[110px] pointer-events-none" />
        <div className="absolute top-[38%] left-[28%] w-[320px] h-[320px] rounded-full bg-teal-400/10 blur-[90px] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none login-dot-grid" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-8 pt-8 pb-10 sm:px-14 sm:pt-12 sm:pb-12">

          {/* ── Top bar ── */}
          <div className="flex items-center justify-between">
            <AppLogoBrand size="md" />
            <button
              type="button"
              onClick={toggleLocale}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-slate-300 hover:bg-white/10 transition-all"
            >
              <Languages className="h-3.5 w-3.5 shrink-0" />
              {isAr ? "Français" : "العربية"}
            </button>
          </div>

          {/* ── Middle: tagline ── */}
          <div className="flex-1 flex flex-col justify-center max-w-lg w-full mx-auto py-10">

            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 mb-6 self-start">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-teal-300 text-xs font-medium tracking-widest uppercase">
                {isAr ? "منصة حية" : "Plateforme active"}
              </span>
            </div>

            {/* Tagline */}
            <h1 className="text-[2rem] sm:text-[2.5rem] font-bold text-white leading-[1.1] tracking-tight">
              {t.brandTagline}
              <br />
              <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                {t.brandTaglineHL}
              </span>
            </h1>

            <p className="mt-4 text-slate-400 text-[15px] leading-relaxed max-w-sm">
              {t.brandDesc}
            </p>
          </div>

          {/* ── Bottom: stats + CTA + copyright ── */}
          <div className="max-w-lg w-full mx-auto space-y-4">

            {/* Stats — en bas */}
            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/[0.08] hover:border-teal-500/30 transition-all duration-300 group"
                >
                  <p className="text-[1.9rem] font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent leading-none">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 font-medium group-hover:text-slate-400 transition-colors">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setView("form")}
              className="group w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-teal-500 hover:bg-teal-400 active:scale-[0.99] text-white font-semibold text-[15px] transition-all duration-300 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/35"
            >
              <span>{t.loginButton}</span>
              <span className="w-9 h-9 rounded-xl bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-all group-hover:translate-x-0.5">
                {isAr
                  ? <ArrowLeft  className="h-4 w-4" />
                  : <ArrowRight className="h-4 w-4" />}
              </span>
            </button>

            <p className="text-xs text-slate-600 text-center">{t.copyright}</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          PANNEAU 2 — Formulaire (même style)
      ═══════════════════════════════════════════ */}
      <div
        dir={isAr ? "rtl" : "ltr"}
        className={cn(
          "absolute inset-0 flex flex-col login-brand-panel transition-transform duration-700 ease-in-out",
          view === "brand" ? formEnter : "translate-x-0"
        )}
      >
        {/* Aurora orbs — miroir */}
        <div className="absolute bottom-[-15%] left-[-5%] w-[550px] h-[550px] rounded-full bg-teal-500/20 blur-[140px] pointer-events-none" />
        <div className="absolute top-[-20%] right-[-10%] w-[480px] h-[480px] rounded-full bg-indigo-600/15 blur-[110px] pointer-events-none" />
        <div className="absolute top-[30%] left-[35%] w-[280px] h-[280px] rounded-full bg-teal-400/10 blur-[90px] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none login-dot-grid" />

        {/* ── Top bar ── */}
        <div className="relative z-10 flex items-center justify-between px-8 pt-8 sm:px-14 sm:pt-12">
          <button
            type="button"
            onClick={() => setView("brand")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-slate-300 hover:bg-white/10 transition-all"
          >
            {isAr
              ? <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              : <ArrowLeft  className="h-3.5 w-3.5 shrink-0" />}
            {tCommon.back}
          </button>

          <button
            type="button"
            onClick={toggleLocale}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-slate-300 hover:bg-white/10 transition-all"
          >
            <Languages className="h-3.5 w-3.5 shrink-0" />
            {isAr ? "Français" : "العربية"}
          </button>
        </div>

        {/* ── Form ── */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-8 pb-10 sm:px-14 overflow-y-auto">
          <div className="w-full max-w-[400px]">

            {/* Logo centré */}
            <div className="flex justify-center mb-8">
              <AppLogoBrand size="md" />
            </div>

            {/* Header */}
            <div className="mb-9 text-center">
              <h2 className="text-[1.9rem] font-bold text-white tracking-tight">
                {t.title}
              </h2>
              <p className="text-slate-400 mt-2 text-[15px]">{t.subtitle}</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-sm text-red-300">
                <div className="shrink-0 mt-px w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
                  <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                </div>
                <span className="pt-0.5 leading-relaxed">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  {t.emailLabel}
                </label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder={t.emailPlaceholder}
                  error={errors.email?.message}
                  autoComplete="email"
                  dir="ltr"
                  className="h-12 rounded-xl px-4 text-[15px] text-white bg-white/[0.07] border-white/15 placeholder:text-slate-600 focus-visible:bg-white/10 focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  {t.passwordLabel}
                </label>
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  autoComplete="current-password"
                  dir="ltr"
                  className="h-12 rounded-xl px-4 text-[15px] text-white bg-white/[0.07] border-white/15 placeholder:text-slate-600 focus-visible:bg-white/10 focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 hover:text-slate-200 transition-colors"
                    >
                      {showPassword
                        ? <EyeOff className="h-4 w-4" />
                        : <Eye    className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-teal-500 hover:bg-teal-400 disabled:opacity-60 disabled:pointer-events-none active:scale-[0.99] text-white font-semibold text-[15px] transition-all duration-300 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/35"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-3">
                      <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {tCommon.loading}
                    </span>
                  ) : (
                    <>
                      <span>{t.loginButton}</span>
                      <span className="w-9 h-9 rounded-xl bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-all group-hover:translate-x-0.5">
                        {isAr
                          ? <ArrowLeft  className="h-4 w-4" />
                          : <ArrowRight className="h-4 w-4" />}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600 leading-relaxed">
              {t.contactAdmin}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
