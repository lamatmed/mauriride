"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MoreVertical, Pencil, Lock, Unlock, KeyRound, Trash2, AlertTriangle,
} from "lucide-react";
import { useLocale } from "@/lib/stores/locale";
import { getT } from "@/lib/i18n";

interface Company {
  id: string;
  name: string;
  nameAr?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
  adminEmail?: string | null;
  adminName?: string | null;
}

export function CompanyActions({ company }: { company: Company }) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = getT(locale).supervisor.actions;
  const isAr = locale === "ar";

  const [modal, setModal] = useState<"edit" | "password" | "delete" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editData, setEditData] = useState({
    name:      company.name,
    nameAr:    company.nameAr ?? "",
    email:     company.adminEmail ?? company.email ?? "",
    adminName: company.adminName ?? "",
    phone:     company.phone ?? "",
    address:   company.address ?? "",
  });

  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const close = () => { setModal(null); setError(null); setPassword(""); };
  const refresh = () => { router.refresh(); close(); };

  const api = (path: string, method: string, body?: object) =>
    fetch(`/api/supervisor/companies/${company.id}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });

  const handleToggleStatus = async () => {
    setLoading(true);
    await api("/status", "PATCH");
    setLoading(false);
    router.refresh();
  };

  const handleEdit = async () => {
    setError(null);
    setLoading(true);
    const res = await api("", "PATCH", editData);
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error); return; }
    refresh();
  };

  const handlePassword = async () => {
    setError(null);
    if (password.length < 8) { setError(getT(locale).errors.passwordMin8); return; }
    setLoading(true);
    const res = await api("/password", "PATCH", { password });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error); return; }
    refresh();
  };

  const handleDelete = async () => {
    setLoading(true);
    await api("", "DELETE");
    setLoading(false);
    router.refresh();
    close();
  };

  const saveLabel  = getT(locale).common.save;
  const cancelLabel = getT(locale).common.cancel;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label={t.actions ?? "Actions"} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isAr ? "start" : "end"} className="w-52">
          <DropdownMenuItem onClick={() => setModal("edit")} className="gap-2">
            <Pencil className="h-4 w-4" /> {t.edit}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus} disabled={loading} className="gap-2">
            {company.isActive
              ? <><Lock className="h-4 w-4 text-amber-500" /> {t.block}</>
              : <><Unlock className="h-4 w-4 text-emerald-500" /> {t.unblock}</>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setModal("password")} className="gap-2">
            <KeyRound className="h-4 w-4" /> {t.changePassword}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setModal("delete")}
            className="gap-2 text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4" /> {t.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Edit modal ── */}
      <Dialog open={modal === "edit"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-lg" dir={isAr ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t.editTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            <div>
              <label className="form-label block mb-1">{t.name}</label>
              <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
            </div>
            <div>
              <label className="form-label block mb-1">{t.nameAr}</label>
              <Input value={editData.nameAr} onChange={(e) => setEditData({ ...editData, nameAr: e.target.value })} dir="rtl" />
            </div>
            <div>
              <label className="form-label block mb-1">{t.adminName}</label>
              <Input value={editData.adminName} onChange={(e) => setEditData({ ...editData, adminName: e.target.value })} />
            </div>
            <div>
              <label className="form-label block mb-1">{t.email}</label>
              <Input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} dir="ltr" />
            </div>
            <div>
              <label className="form-label block mb-1">{t.phone}</label>
              <Input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} dir="ltr" />
            </div>
            <div>
              <label className="form-label block mb-1">{t.address}</label>
              <Input value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>{cancelLabel}</Button>
            <Button onClick={handleEdit} loading={loading} className="bg-violet-600 hover:bg-violet-700 text-white">
              {saveLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Password modal ── */}
      <Dialog open={modal === "password"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-sm" dir={isAr ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t.passwordTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              {t.passwordHint.replace("{company}", company.name)}
            </p>
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            <Input
              type={showPw ? "text" : "password"}
              placeholder={t.passwordPh}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
            />
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} />
              {getT(locale).common.showPassword}
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>{cancelLabel}</Button>
            <Button onClick={handlePassword} loading={loading} className="bg-violet-600 hover:bg-violet-700 text-white">
              {saveLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete modal ── */}
      <Dialog open={modal === "delete"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-sm" dir={isAr ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {t.deleteTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              {t.deleteWarning.replace("{company}", company.name)}
            </p>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
              {t.deleteIrreversible}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>{cancelLabel}</Button>
            <Button onClick={handleDelete} loading={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {t.deleteConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
