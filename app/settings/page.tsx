import { getSettings } from "@/services/settings.service";
import { saveSettingsAction } from "@/actions/settings.actions";
import { requireRole } from "@/lib/auth";
import Link from "next/link";

export default async function Settings() {
  await requireRole("ADMIN");
  const s = await getSettings();
  const field = (label: string, name: string, value?: string | number, type = "text") => (
    <label key={name} className="text-sm font-medium">{label}<input type={type} name={name} defaultValue={value ?? ""} className="mt-1 w-full rounded-lg border bg-white p-2" /></label>
  );
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm text-blue-600">Configuration</p><h1 className="text-3xl font-bold">Entreprise</h1><p className="mt-1 text-sm text-slate-500">Informations utilisées dans les factures et devis.</p></div>
          <Link href="/settings/users" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50">Gérer les utilisateurs</Link>
        </div>
        <form action={saveSettingsAction} className="mt-6 grid gap-6">
          <section className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-2">
            <h2 className="font-semibold md:col-span-2">Identité</h2>
            {field("Nom de l’entreprise", "companyName", s?.companyName)}
            {field("Logo URL", "logoUrl", s?.logoUrl)}
            {field("Email", "email", s?.email, "email")}
            {field("Téléphone", "phone", s?.phone)}
            {field("Site web", "website", s?.website, "url")}
            {field("Adresse", "address", s?.address)}
            {field("Ville", "city", s?.city)}
            {field("Pays", "country", s?.country)}
            {field("SIRET", "siret", s?.siret)}
            {field("N° TVA", "vatNumber", s?.vatNumber)}
          </section>
          <section className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-2">
            <h2 className="font-semibold md:col-span-2">Facturation</h2>
            {field("Devise (ISO)", "currency", s?.currency ?? "EUR")}
            {field("Locale", "locale", s?.locale ?? "fr-FR")}
            {field("Préfixe facture", "invoicePrefix", s?.invoicePrefix ?? "FAC")}
            {field("Chiffres dans le numéro", "invoiceNumberPadding", s?.invoiceNumberPadding ?? 4, "number")}
            {field("TVA par défaut (%)", "defaultTaxRate", s?.defaultTaxRate ? Number(s.defaultTaxRate) : 20, "number")}
          </section>
          <section className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-2">
            <h2 className="font-semibold md:col-span-2">Coordonnées bancaires</h2>
            {field("Banque", "bankName", s?.bankName)}
            {field("IBAN", "iban", s?.iban)}
            {field("BIC", "bic", s?.bic)}
          </section>
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800">Enregistrer les paramètres</button>
        </form>
      </div>
    </main>
  );
}