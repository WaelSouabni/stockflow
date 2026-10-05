import { getSettings } from "@/services/settings.service";
import { completeOnboardingAction } from "@/actions/onboarding.actions";
import { requireRole } from "@/lib/auth";

export default async function OnboardingPage() {
  await requireRole("ADMIN");
  const settings = await getSettings({ allowIncomplete: true });

  const input = (label: string, name: string, value?: string | number | null, type = "text", required = true) => (
    <label className="block text-sm font-medium">
      {label}
      <input name={name} type={type} required={required} defaultValue={value ?? ""} className="mt-1 w-full rounded-xl border bg-white p-3 outline-none ring-blue-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950" />
    </label>
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600">Bienvenue sur StockFlow</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Configurez votre entreprise</h1>
          <p className="mt-2 text-slate-500">Ces informations seront utilisées dans vos factures, devis et communications.</p>
        </div>
        <form action={completeOnboardingAction} className="space-y-6">
          <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <h2 className="font-semibold">Identité et coordonnées</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {input("Nom de l’entreprise", "companyName", settings?.companyName)}
              {input("Email professionnel", "email", settings?.email, "email")}
              {input("Adresse", "address", settings?.address)}
              {input("Ville", "city", settings?.city)}
              {input("Code postal", "zip", settings?.zip)}
              {input("Pays", "country", settings?.country)}
              {input("Téléphone", "phone", settings?.phone, "tel", false)}
              {input("SIRET", "siret", settings?.siret, "text", false)}
              {input("N° TVA", "vatNumber", settings?.vatNumber, "text", false)}
            </div>
          </section>
          <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <h2 className="font-semibold">Facturation</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {input("Devise (ISO)", "currency", settings?.currency ?? "EUR")}
              {input("Locale", "locale", settings?.locale ?? "fr-FR")}
              {input("Préfixe facture", "invoicePrefix", settings?.invoicePrefix ?? "FAC")}
              {input("Chiffres dans le numéro", "invoiceNumberPadding", settings?.invoiceNumberPadding ?? 4, "number")}
              {input("TVA par défaut (%)", "defaultTaxRate", settings?.defaultTaxRate ? Number(settings.defaultTaxRate) : 20, "number")}
            </div>
          </section>
          <button className="w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900">Terminer la configuration</button>
        </form>
      </div>
    </main>
  );
}
