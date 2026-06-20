"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Building2, User, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const schema = z.object({
  // Société
  companyName:   z.string().min(2, "Nom requis (min 2 caractères)"),
  companyNameAr: z.string().optional(),
  companyEmail:  z.string().email("Email société invalide"),
  companyPhone:  z.string().optional(),
  companyAddress: z.string().optional(),
  // Admin
  adminName:     z.string().min(2, "Nom admin requis"),
  adminEmail:    z.string().email("Email admin invalide"),
  adminPassword: z.string().min(8, "Mot de passe : min 8 caractères"),
});

type FormData = z.infer<typeof schema>;

export function CompanyForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
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
        setError(json.error ?? "Erreur lors de la création");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/supervisor/companies"), 2000);
    } catch {
      setError("Erreur réseau. Réessayez.");
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Société créée avec succès !</h3>
        <p className="text-muted-foreground">Redirection vers la liste des sociétés…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
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
          <h3 className="font-semibold text-foreground">Informations société</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label block mb-1.5">Nom de la société *</label>
            <Input
              {...register("companyName")}
              placeholder="Transport Mauritanie SARL"
              error={errors.companyName?.message}
            />
          </div>
          <div className="col-span-2">
            <label className="form-label block mb-1.5">Nom en arabe</label>
            <Input
              {...register("companyNameAr")}
              placeholder="شركة النقل الموريتانية"
              dir="rtl"
              className="font-arabic"
            />
          </div>
          <div>
            <label className="form-label block mb-1.5">Email société *</label>
            <Input
              {...register("companyEmail")}
              type="email"
              placeholder="contact@transport.mr"
              error={errors.companyEmail?.message}
            />
          </div>
          <div>
            <label className="form-label block mb-1.5">Téléphone</label>
            <Input
              {...register("companyPhone")}
              placeholder="+222 45 00 00 00"
            />
          </div>
          <div className="col-span-2">
            <label className="form-label block mb-1.5">Adresse</label>
            <Input
              {...register("companyAddress")}
              placeholder="Avenue Gamal Abdel Nasser, Nouakchott"
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t" />

      {/* Admin */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
            <User className="h-4 w-4 text-teal-600" />
          </div>
          <h3 className="font-semibold text-foreground">Compte administrateur</h3>
          <span className="text-xs text-muted-foreground">(SUPER_ADMIN de la société)</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label block mb-1.5">Nom complet *</label>
            <Input
              {...register("adminName")}
              placeholder="Ahmed Ould Directeur"
              error={errors.adminName?.message}
            />
          </div>
          <div>
            <label className="form-label block mb-1.5">Email admin *</label>
            <Input
              {...register("adminEmail")}
              type="email"
              placeholder="admin@transport.mr"
              error={errors.adminEmail?.message}
            />
          </div>
          <div>
            <label className="form-label block mb-1.5">Mot de passe *</label>
            <Input
              {...register("adminPassword")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              error={errors.adminPassword?.message}
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

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          loading={isSubmitting}
          className="bg-violet-600 hover:bg-violet-700 text-white px-8"
        >
          Créer la société
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
