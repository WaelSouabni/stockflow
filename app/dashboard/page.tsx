import Link from "next/link";
import { getDashboardData } from "@/services/dashboard.service";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

type Props = { searchParams?: { period?: string } };

const periods = [
  { value: "180", label: "6 mois" },
  { value: "365", label: "12 mois" },
];

function formatCurrency(value: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

export default async function Dashboard({ searchParams }: Props) {
  const period = searchParams?.period === "365" ? 365 : 180;
  const d = await getDashboardData(period);
  const currency = d.currency;
  const locale = d.locale;

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Vue d’ensemble</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Suivez la santé de votre stock et votre activité commerciale.</p>
          </div>
          <div className="flex rounded-xl border bg-white p-1 shadow-sm">
            {periods.map((item) => (
              <Link
                key={item.value}
                href={`/dashboard?period=${item.value}`}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${period === Number(item.value) ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/stock" className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-slate-500">Valeur du stock</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(d.stockValue, locale, currency)}</p>
            <p className="mt-1 text-xs text-slate-400">Au prix de revient</p>
          </Link>
          <Link href="/stock" className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-slate-500">Alertes stock</p>
            <p className="mt-2 text-2xl font-bold">{d.totalLowStock}</p>
            <p className="mt-1 text-xs text-slate-400">Produits au seuil minimum</p>
          </Link>
          <Link href="/invoices" className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-slate-500">Factures impayées</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(d.unpaidAmount, locale, currency)}</p>
            <p className="mt-1 text-xs text-slate-400">{d.unpaidCount} facture(s) à encaisser</p>
          </Link>
          <Link href="/invoices" className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-slate-500">CA payé</p>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(d.revenue, locale, currency)}</p>
            <p className="mt-1 text-xs text-slate-400">{d.invoiceCount} facture(s) active(s) sur la période</p>
          </Link>
        </section>

        <DashboardCharts monthly={d.monthly} movements={d.movements} locale={locale} currency={currency} />

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div><h2 className="font-semibold">Alertes stock</h2><p className="text-sm text-slate-500">Produits à réapprovisionner</p></div>
              <Link href="/stock" className="text-sm font-medium text-blue-600 hover:underline">Voir le stock</Link>
            </div>
            <div className="mt-4 divide-y">
              {d.lowStockProducts.length ? d.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0"><p className="truncate font-medium">{product.name}</p><p className="text-xs text-slate-500">Seuil : {product.minStock}</p></div>
                  <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{product.stock} en stock</span>
                </div>
              )) : <p className="py-8 text-center text-sm text-slate-500">Aucune alerte stock.</p>}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div><h2 className="font-semibold">Dernières factures</h2><p className="text-sm text-slate-500">Activité récente</p></div>
              <Link href="/invoices" className="text-sm font-medium text-blue-600 hover:underline">Voir les factures</Link>
            </div>
            <div className="mt-4 divide-y">
              {d.invoices.length ? d.invoices.slice(0, 8).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0"><p className="truncate font-medium">{invoice.number}</p><p className="text-xs text-slate-500">{invoice.customer.name} · {new Date(invoice.issueDate).toLocaleDateString(locale)}</p></div>
                  <div className="shrink-0 text-right"><p className="font-semibold">{formatCurrency(Number(invoice.total), locale, invoice.currency || currency)}</p><p className="text-xs text-slate-500">{invoice.status}</p></div>
                </div>
              )) : <p className="py-8 text-center text-sm text-slate-500">Aucune facture sur la période.</p>}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div><h2 className="font-semibold">Derniers mouvements</h2><p className="text-sm text-slate-500">Entrées, sorties et ajustements sur la période</p></div>
            <Link href="/stock" className="text-sm font-medium text-blue-600 hover:underline">Historique</Link>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {d.movements.slice(0, 9).map((movement) => (
              <div key={movement.id} className="rounded-xl border p-3">
                <div className="flex items-center justify-between gap-3"><span className="text-sm font-medium">{movement.product.name}</span><span className="text-xs font-semibold">{movement.type}</span></div>
                <div className="mt-1 flex justify-between text-xs text-slate-500"><span>{new Date(movement.createdAt).toLocaleDateString(locale)}</span><span>{movement.quantity}</span></div>
              </div>
            ))}
            {!d.movements.length && <p className="py-8 text-center text-sm text-slate-500 sm:col-span-2 lg:col-span-3">Aucun mouvement sur la période.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}