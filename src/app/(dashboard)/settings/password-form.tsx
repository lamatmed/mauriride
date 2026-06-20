"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useLocale } from "@/lib/stores/locale";

const schemaFr = z.object({
  currentPassword: z.string().min(1, "Requis"),
  newPassword:     z.string().min(6, "Minimum 6 caractères"),
  confirmPassword: z.string().min(1, "Requis"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

const schemaAr = z.object({
  currentPassword: z.string().min(1, "مطلوب"),
  newPassword:     z.string().min(6, "6 أحرف على الأقل"),
  confirmPassword: z.string().min(1, "مطلوب"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schemaFr>;

function PasswordInput({ label, error, isAr, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; isAr?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="form-label block mb-1.5">{label}</label>
      <div className="relative">
        <Input {...props} type={show ? "text" : "password"} error={error} className={isAr ? "pl-10" : "pr-10"} dir="ltr" />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className={`absolute ${isAr ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground`}
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function PasswordForm() {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(isAr ? schemaAr : schemaFr),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : (isAr ? "خطأ أثناء التغيير" : "Erreur lors du changement"));
        return;
      }
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError(isAr ? "خطأ في الشبكة. حاول مرة أخرى." : "Erreur réseau. Réessayez.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2" dir={isAr ? "rtl" : "ltr"}>
          <Shield className="h-4 w-4 text-teal-500" />
          {isAr ? "تغيير كلمة المرور" : "Changer le mot de passe"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir={isAr ? "rtl" : "ltr"}>
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {isAr ? "تم تغيير كلمة المرور بنجاح" : "Mot de passe modifié avec succès"}
            </div>
          )}

          <PasswordInput
            label={isAr ? "كلمة المرور الحالية" : "Mot de passe actuel"}
            error={errors.currentPassword?.message}
            isAr={isAr}
            {...register("currentPassword")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordInput
              label={isAr ? "كلمة المرور الجديدة" : "Nouveau mot de passe"}
              error={errors.newPassword?.message}
              isAr={isAr}
              {...register("newPassword")}
            />
            <PasswordInput
              label={isAr ? "تأكيد الكلمة الجديدة" : "Confirmer le nouveau"}
              error={errors.confirmPassword?.message}
              isAr={isAr}
              {...register("confirmPassword")}
            />
          </div>

          <Button type="submit" loading={isSubmitting} size="sm">
            {isAr ? "تغيير كلمة المرور" : "Changer le mot de passe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
