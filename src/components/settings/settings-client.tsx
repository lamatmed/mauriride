"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Building2, ImageIcon, Upload, CheckCircle } from "lucide-react";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";
import { useUploadThing } from "@/lib/uploadthing";
import { AppLogoIcon } from "@/components/ui/app-logo";

interface CompanyInfo {
  name: string;
  nameAr: string | null;
  logo?: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export function SettingsHeader() {
  const { locale } = useLocale();
  const t = getT(locale).settings;
  return <Header title={t.title} subtitle={t.subtitle} />;
}

export function SettingsLogoCard({ logo }: { logo: string | null }) {
  const { locale } = useLocale();
  const t = getT(locale).settings;
  const isAr = locale === "ar";
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [success, setSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { startUpload, isUploading } = useUploadThing("companyLogo", {
    onClientUploadComplete: () => {
      setSuccess(true);
      setUploadError(null);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    },
    onUploadError: (err) => {
      setUploadError(err.message);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2" dir={isAr ? "rtl" : "ltr"}>
          <ImageIcon className="h-4 w-4 text-teal-500" />
          {t.logo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`flex items-center gap-5 ${isAr ? "flex-row-reverse" : ""}`}>
          {/* Logo preview */}
          <div className="relative flex-shrink-0">
            {logo ? (
              <img
                src={logo}
                alt="Logo"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-border shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted">
                <AppLogoIcon size="md" />
              </div>
            )}
            {success && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          {/* Upload section */}
          <div className={isAr ? "text-right" : ""}>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              title={t.uploadLogo}
              aria-label={t.uploadLogo}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadError(null);
                  startUpload([file]);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={isUploading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading
                ? (isAr ? "جاري الرفع..." : "Téléchargement...")
                : t.uploadLogo}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">{t.logoHint}</p>
            {uploadError && (
              <p className="text-xs text-red-500 mt-1">{uploadError}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsCompanyCard({ company }: { company: CompanyInfo }) {
  const { locale } = useLocale();
  const t  = getT(locale).settings;
  const isAr = locale === "ar";
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4 text-teal-500" />
          {t.company}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <p className="text-base font-bold text-foreground">
              {isAr && company.nameAr ? company.nameAr : company.name}
            </p>
            {company.nameAr && (
              <p className="text-sm text-muted-foreground" dir={isAr ? "ltr" : "rtl"}>
                {isAr ? company.name : company.nameAr}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {company.email && (
            <div className="text-sm">
              <p className="text-muted-foreground mb-0.5">{t.email}</p>
              <p className="font-medium">{company.email}</p>
            </div>
          )}
          {company.phone && (
            <div className="text-sm">
              <p className="text-muted-foreground mb-0.5">{t.phone}</p>
              <p className="font-medium" dir="ltr">{company.phone}</p>
            </div>
          )}
          {company.address && (
            <div className="text-sm sm:col-span-2">
              <p className="text-muted-foreground mb-0.5">{t.address}</p>
              <p className="font-medium">{company.address}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsNotificationsCard() {
  const { locale } = useLocale();
  const t = getT(locale).settings.notifications;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-teal-500" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{t.message}</p>
      </CardContent>
    </Card>
  );
}
