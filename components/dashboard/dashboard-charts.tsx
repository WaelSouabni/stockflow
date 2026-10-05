"use client";

import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { groupMovementQuantities } from "@/lib/dashboard-calculations";

type Props = {
  monthly: Array<{ month: string; revenue: number }>;
  movements: Array<{ type: string; quantity: number }>;
  locale: string;
  currency: string;
};

export function DashboardCharts({ monthly, movements, locale, currency }: Props) {
  const grouped = groupMovementQuantities(movements);
  const format = (value: number) => new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div><h2 className="font-semibold">CA payé</h2><p className="text-sm text-slate-500">Évolution mensuelle</p></div>
        <div className="mt-5 h-72">
          {monthly.length ? <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => format(Number(value))} />
              <Line type="monotone" dataKey="revenue" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-slate-500">Pas encore de données.</div>}
        </div>
      </section>
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div><h2 className="font-semibold">Mouvements de stock</h2><p className="text-sm text-slate-500">Volumes par type sur la période</p></div>
        <div className="mt-5 h-72">
          {grouped.length ? <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grouped}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" />
            </BarChart>
          </ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-slate-500">Pas encore de données.</div>}
        </div>
      </section>
    </div>
  );
}