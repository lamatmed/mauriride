"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, CheckCircle, AlertCircle } from "lucide-react";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import type { UserRole } from "@prisma/client";

const schemaFr = z.object({
  name:  z.string().min(2, "Nom requis (min 2 caractères)"),
  email: z.string().email("Email invalide"),
});
const schemaAr = z.object({
  name:  z.string().min(2, "الاسم مطلوب (حرفان على الأقل)"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
});

type FormData = { name: string; email: string };

export function ProfileForm({ lastLoginAt }: { lastLoginAt?: Date | null }) {
  const { data: session, update } = useSession();
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(isAr ? schemaAr : schemaFr),
    defaultValues: {
      name:  session?.user?.name  ?? "",
      email: session?.user?.email ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : (isAr ? "خطأ أثناء التحديث" : "Erreur lors de la mise à jour"));
        return;
      }
      await update({ name: json.user.name, email: json.user.email });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError(isAr ? "خطأ في الشبكة. حاول مرة أخرى." : "Erreur réseau. Réessayez.");
    }
  };

  const dateStr = lastLoginAt
    ? new Date(lastLoginAt).toLocaleDateString(isAr ? "ar-MA" : "fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null;
  const timeStr = lastLoginAt
    ? new Date(lastLoginAt).toLocaleTimeString(isAr ? "ar-MA" : "fr-FR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2" dir={isAr ? "rtl" : "ltr"}>
          <User className="h-4 w-4 text-teal-500" />
          {isAr ? "الملف الشخصي" : "Profil utilisateur"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`flex items-center gap-4 mb-5 ${isAr ? "flex-row-reverse" : ""}`}>
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className={isAr ? "text-right" : ""}>
            <p className="font-semibold text-foreground">{session?.user?.name}</p>
            <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            <Badge variant="teal" className="mt-1">
              {(getT(locale).roles as Record<string, string>)[session?.user?.role ?? ""] ?? session?.user?.role}
            </Badge>
            {dateStr && timeStr && (
              <p className="text-xs text-muted-foreground mt-1" dir={isAr ? "rtl" : "ltr"}>
                {isAr
                  ? `آخر دخول : ${dateStr} الساعة ${timeStr}`
                  : `Dernière connexion : ${dateStr} à ${timeStr}`}
              </p>
            )}
          </div>
        </div>

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
              {isAr ? "تم تحديث الملف الشخصي بنجاح" : "Profil mis à jour avec succès"}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label block mb-1.5">{isAr ? "الاسم الكامل" : "Nom complet"}</label>
              <Input {...register("name")} error={errors.name?.message} dir={isAr ? "rtl" : "ltr"} />
            </div>
            <div>
              <label className="form-label block mb-1.5">{isAr ? "البريد الإلكتروني" : "Email"}</label>
              <Input {...register("email")} type="email" error={errors.email?.message} dir="ltr" />
            </div>
          </div>

          <Button type="submit" loading={isSubmitting} size="sm">
            {isAr ? "حفظ التغييرات" : "Enregistrer les modifications"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
