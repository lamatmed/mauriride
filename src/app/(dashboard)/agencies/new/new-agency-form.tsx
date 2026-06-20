"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

const schemaFr = z.object({
  name:    z.string().min(2, "Nom requis (min 2 car.)"),
  city:    z.string().min(2, "Ville requise"),
  address: z.string().optional(),
  phone:   z.string().optional(),
  email:   z.string().email("Email invalide").optional().or(z.literal("")),
});

const schemaAr = z.object({
  name:    z.string().min(2, "الاسم مطلوب (حرفان على الأقل)"),
  city:    z.string().min(2, "المدينة مطلوبة"),
  address: z.string().optional(),
  phone:   z.string().optional(),
  email:   z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schemaFr>;

export function NewAgencyForm() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = getT(locale);
  const tf = t.agencies.form;
  const isAr = locale === "ar";

  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(isAr ? schemaAr : schemaFr),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const res  = await fetch("/api/agencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? t.errors.createError);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/agencies"), 1500);
    } catch {
      setError(t.errors.network);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-foreground">{tf.success}</h3>
        <p className="text-muted-foreground">{tf.redirecting}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl" dir={isAr ? "rtl" : "ltr"}>
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
          <Building2 className="h-4 w-4 text-teal-600" />
        </div>
        <h3 className="font-semibold text-foreground">{tf.sectionTitle}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="form-label block mb-1.5">{tf.name}</label>
          <Input {...register("name")} placeholder={tf.namePh} error={errors.name?.message} />
        </div>

        <div className="col-span-2">
          <label className="form-label block mb-1.5">{tf.city}</label>
          <Input {...register("city")} placeholder={tf.cityPh} error={errors.city?.message} />
        </div>

        <div className="col-span-2">
          <label className="form-label block mb-1.5">{tf.address}</label>
          <Input {...register("address")} placeholder={tf.addressPh} />
        </div>

        <div>
          <label className="form-label block mb-1.5">{tf.phone}</label>
          <Input {...register("phone")} placeholder={tf.phonePh} dir="ltr" />
        </div>

        <div>
          <label className="form-label block mb-1.5">{tf.email}</label>
          <Input {...register("email")} type="email" placeholder={tf.emailPh} dir="ltr" error={errors.email?.message} />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={isSubmitting} className="px-8">
          {tf.submit}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/agencies")}>
          {tf.cancel}
        </Button>
      </div>
    </form>
  );
}
