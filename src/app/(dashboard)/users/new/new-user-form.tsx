"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Users, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import type { Agency } from "@prisma/client";

const ROLES_NEED_AGENCY = ["AGENCY_MANAGER", "AGENT", "CASHIER", "CONTROLLER", "DRIVER"];

const schemaFr = z.object({
  name:     z.string().min(2, "Nom requis (min 2 car.)"),
  email:    z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
  role:     z.enum(["DIRECTOR", "AGENCY_MANAGER", "AGENT", "CASHIER", "CONTROLLER", "DRIVER"]),
  phone:    z.string().optional(),
  agencyId: z.string().optional(),
});

const schemaAr = z.object({
  name:     z.string().min(2, "الاسم مطلوب (حرفان على الأقل)"),
  email:    z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "6 أحرف على الأقل"),
  role:     z.enum(["DIRECTOR", "AGENCY_MANAGER", "AGENT", "CASHIER", "CONTROLLER", "DRIVER"]),
  phone:    z.string().optional(),
  agencyId: z.string().optional(),
});

type FormData = z.infer<typeof schemaFr>;

export function NewUserForm({ agencies }: { agencies: Agency[] }) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = getT(locale);
  const tu = t.users.form;
  const tr = t.roles;
  const isAr = locale === "ar";

  const [error, setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw]  = useState(false);

  const ROLE_OPTIONS = [
    { value: "DIRECTOR",       label: tr.DIRECTOR },
    { value: "AGENCY_MANAGER", label: tr.AGENCY_MANAGER },
    { value: "AGENT",          label: tr.AGENT },
    { value: "CASHIER",        label: tr.CASHIER },
    { value: "CONTROLLER",     label: tr.CONTROLLER },
    { value: "DRIVER",         label: tr.DRIVER },
  ];

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(isAr ? schemaAr : schemaFr),
    defaultValues: { role: "AGENT" },
  });

  const selectedRole = watch("role");
  const needsAgency  = ROLES_NEED_AGENCY.includes(selectedRole);

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const res  = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = typeof json.error === "string" ? json.error : t.errors.createError;
        setError(msg);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/users"), 1500);
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
        <h3 className="text-xl font-bold">{tu.success}</h3>
        <p className="text-muted-foreground">{tu.redirecting}</p>
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
          <Users className="h-4 w-4 text-teal-600" />
        </div>
        <h3 className="font-semibold">{tu.sectionTitle}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="form-label block mb-1.5">{tu.fullName}</label>
          <Input {...register("name")} placeholder={tu.namePh} error={errors.name?.message} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="form-label block mb-1.5">{tu.phone}</label>
          <Input {...register("phone")} placeholder={tu.phonePh} dir="ltr" />
        </div>

        <div className="col-span-2">
          <label className="form-label block mb-1.5">{tu.email}</label>
          <Input {...register("email")} type="email" placeholder={tu.emailPh} dir="ltr" error={errors.email?.message} />
        </div>

        <div className="col-span-2">
          <label className="form-label block mb-1.5">{tu.password}</label>
          <div className="relative">
            <Input
              {...register("password")}
              type={showPw ? "text" : "password"}
              placeholder={tu.passwordPh}
              error={errors.password?.message}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="form-label block mb-1.5">{tu.role}</label>
          <select
            {...register("role")}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>}
        </div>

        {needsAgency && (
          <div className="col-span-2 sm:col-span-1">
            <label className="form-label block mb-1.5">{tu.agency}</label>
            <select
              {...register("agencyId")}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">{tu.noAgency}</option>
              {agencies.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.city})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={isSubmitting} className="px-8">
          {tu.submit}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/users")}>
          {tu.cancel}
        </Button>
      </div>
    </form>
  );
}
