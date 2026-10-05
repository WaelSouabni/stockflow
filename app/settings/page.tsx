import { getSettings } from "@/services/settings.service";
import { saveSettingsAction } from "@/actions/settings.actions";

export default async function Settings() {
  const s = await getSettings();
  const value = <T,>(input: T | null | undefined) => input ?? undefined;
  const fields: Array<[string, string, string | number | undefined]> = [
    ["companyName", "Nom de l’entreprise", value(s?.companyName)],
    ["email", "Email", value(s?.email)],
    ["phone", "Téléphone", value(s?.phone)],
    ["website", "Site web", value(s?.website)],
    ["address", "Adresse", value(s?.address)],
    ["city", "Ville", value(s?.city)],
    ["country", "Pays", value(s?.country)],
    ["siret", "SIRET", value(s?.siret)],
    ["vatNumber", "TVA", value(s?.vatNumber)],
    ["bankName", "Banque", value(s?.bankName)],
    ["iban", "IBAN", value(s?.iban)],
    ["bic", "BIC", value(s?.bic)],
    ["invoicePrefix", "Préfixe facture", s?.invoicePrefix || "FAC"],
    ["invoiceNumberPadding", "Chiffres facture", s?.invoiceNumberPadding || 4],
    ["defaultTaxRate", "TVA par défaut", s?.defaultTaxRate ? Number(s.defaultTaxRate) : 20],
  ];

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-blue-600">Configuration</p>
        <h1 className="text-3xl font-bold">Entreprise</h1>
        <form action={saveSettingsAction} className="mt-6 grid gap-4 rounded-2xl border bg-white p-6 md:grid-cols-2">
          {fields.map(([name, label, value]) => (
            <label key={name} className="text-sm font-medium">
              {label}
              <input name={name} defaultValue={value} className="mt-1 w-full rounded-lg border p-2" />
            </label>
          ))}
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white md:col-span-2">
            Enregistrer les paramètres
          </button>
        </form>
      </div>
    </main>
  );
}
