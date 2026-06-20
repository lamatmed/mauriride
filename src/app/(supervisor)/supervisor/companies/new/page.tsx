import { CompanyForm } from "./company-form";
import { NewCompanyHeader } from "@/components/supervisor/new-company-header";

export const metadata = { title: "Créer une société" };

export default function NewCompanyPage() {
  return (
    <div className="p-8 max-w-3xl">
      <NewCompanyHeader />
      <CompanyForm />
    </div>
  );
}
