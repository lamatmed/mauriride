"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Building2, User, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

const schemaFr = z.object({
  companyName:    z.string().min(2, "Nom requis (min 2 caractères)"),
  companyNameAr:  z.string().optional(),
  companyPhone:   z.string().optional(),
  companyAddress: z.string().optional(),
  adminName:      z.string().min(2, "Nom admin requis"),
  adminEmail:     z.string().email("Email invalide"),
  adminPassword:  z.string().min(8, "Mot de passe : min 8 caractères"),
});

const schemaAr = z.object({
  companyName:    z.string().min(2, "اسم الشركة مطلوب (حرفان على الأقل)"),
  companyNameAr:  z.string().optional(),
  companyPhone:   z.string().optional(),
  companyAddress: z.string().optional(),
  adminName:      z.string().min(2, "اسم المسؤول مطلوب"),
  adminEmail:     z.string().email("البريد الإلكتروني غير صالح"),
  adminPassword:  z.string().min(8, "كلمة المرور : 8 أحرف على الأقل"),
});

type FormData = z.infer<typeof schemaFr>;

export function CompanyForm() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = getT(locale).supervisor.companyForm;
  const isAr = locale === "ar";

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(isAr ? schemaAr : schemaFr),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const res = await fetch("/api/supervisor/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? getT(locale).errors.createError);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/supervisor/companies"), 2000);
    } catch {
      setError(getT(locale).errors.network);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-foreground">{t.success}</h3>
        <p className="text-muted-foreground">{t.redirecting}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl" dir={isAr ? "rtl" : "ltr"}>
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Société */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-violet-600" />
          </div>
          <h3 className="font-semibold text-foreground">{t.infoSection}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label block mb-1.5">{t.name}</label>
            <Input
              {...register("companyName")}
              placeholder={t.namePh}
              error={errors.companyName?.message}
            />
          </div>
          <div className="col-span-2">
            <label className="form-label block mb-1.5">{t.nameAr}</label>
            <Input
              {...register("companyNameAr")}
              placeholder={t.nameArPh}
              dir="rtl"
            />
          </div>
          <div>
            <label className="form-label block mb-1.5">{t.phone}</label>
            <Input {...register("companyPhone")} placeholder={t.phonePh} dir="ltr" />
          </div>
          <div className="col-span-2">
            <label className="form-label block mb-1.5">{t.address}</label>
            <Input {...register("companyAddress")} placeholder={t.addressPh} />
          </div>
        </div>
      </div>

      <div className="border-t" />

      {/* Admin */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
            <User className="h-4 w-4 text-teal-600" />
          </div>
          <h3 className="font-semibold text-foreground">{t.adminSection}</h3>
          <span className="text-xs text-muted-foreground">{t.adminHint}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label block mb-1.5">{t.adminName}</label>
            <Input
              {...register("adminName")}
              placeholder={t.adminNamePh}
              error={errors.adminName?.message}
            />
          </div>
          <div>
            <label className="form-label block mb-1.5">{t.adminEmail}</label>
            <Input
              {...register("adminEmail")}
              type="email"
              placeholder={t.adminEmailPh}
              error={errors.adminEmail?.message}
              dir="ltr"
            />
          </div>
          <div>
            <label className="form-label block mb-1.5">{t.adminPassword}</label>
            <Input
              {...register("adminPassword")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              error={errors.adminPassword?.message}
              dir="ltr"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          loading={isSubmitting}
          className="bg-violet-600 hover:bg-violet-700 text-white px-8"
        >
          {t.submit}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {getT(locale).common.cancel}
        </Button>
      </div>
    </form>
  );
}
