"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useInvoiceStore } from "@/stores/invoice.store";
import { calculateInvoiceTotals, formatCurrency } from "@/lib/invoice";
import { createInvoiceAction } from "@/actions/invoice.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InvoiceForm({ customers, defaultTaxRate = 20, type = "INVOICE" }: {
  customers: Array<{ id: string; name: string }>; defaultTaxRate?: number; type?: "INVOICE" | "QUOTE";
}) {
  const s = useInvoiceStore();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { s.setTaxRate(defaultTaxRate); }, [defaultTaxRate]);
  const totals = calculateInvoiceTotals(s.items, s.taxRate, s.globalDiscount);

  async function save() {
    setError("");
    if (!s.customerId) return setError("Sélectionnez un client.");
    if (!s.items.some(i => i.description.trim() && i.quantity > 0 && i.unitPrice >= 0)) return setError("Ajoutez au moins une ligne valide.");
    if (s.items.some(i => i.discount > i.quantity * i.unitPrice)) return setError("Une remise de ligne dépasse le montant de la ligne.");
    if (s.globalDiscount > totals.subtotal) return setError("La remise globale dépasse le sous-total.");
    try {
      setSaving(true);
      await createInvoiceAction({
        type,
        customerId: s.customerId,
        items: s.items.filter(i => i.description.trim()).map(i => ({
          description: i.description.trim(), quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount,
        })),
        taxRate: s.taxRate,
        discount: s.globalDiscount,
      });
      router.push(type === "QUOTE" ? "/quotes" : "/invoices");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d’enregistrer le document.");
    } finally { setSaving(false); }
  }

  return <div className="space-y-6">
    <div className="rounded-2xl border bg-white p-5">
      <label className="text-sm font-medium">Client</label>
      <select className="mt-2 w-full rounded-lg border p-2" value={s.customerId} onChange={e => s.setCustomerId(e.target.value)}>
        <option value="">Sélectionner un client</option>
        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="flex items-center justify-between border-b p-5"><div><h2 className="font-semibold">Articles</h2><p className="text-sm text-slate-500">Quantité, prix unitaire et remise par ligne.</p></div><Button type="button" onClick={s.addItem}>Ajouter une ligne</Button></div>
      <div className="divide-y">
        {s.items.map(i => <div key={i.id} className="grid gap-3 p-4 md:grid-cols-[1fr_100px_130px_120px_100px]">
          <Input placeholder="Description" value={i.description} onChange={e => s.updateItem(i.id, { description: e.target.value })} />
          <Input type="number" min="0.001" step=".001" value={i.quantity} onChange={e => s.updateItem(i.id, { quantity: Number(e.target.value) })} />
          <Input type="number" min="0" step=".01" value={i.unitPrice} onChange={e => s.updateItem(i.id, { unitPrice: Number(e.target.value) })} />
          <Input type="number" min="0" step=".01" value={i.discount} onChange={e => s.updateItem(i.id, { discount: Number(e.target.value) })} />
          <Button type="button" className="bg-red-600" disabled={s.items.length === 1} onClick={() => s.removeItem(i.id)}>Supprimer</Button>
        </div>)}
      </div>
    </div>
    <div className="ml-auto max-w-sm rounded-2xl border bg-white p-5 space-y-3">
      <label className="text-sm font-medium">TVA (%)</label>
      <Input type="number" min="0" max="100" step=".01" value={s.taxRate} onChange={e => s.setTaxRate(Number(e.target.value))} />
      <label className="text-sm font-medium">Remise globale</label>
      <Input type="number" min="0" step=".01" value={s.globalDiscount} onChange={e => s.setGlobalDiscount(Number(e.target.value))} />
      <div className="flex justify-between text-sm"><span>Sous-total</span><b>{formatCurrency(totals.subtotal)}</b></div>
      <div className="flex justify-between text-sm"><span>Remise</span><b>- {formatCurrency(totals.discount)}</b></div>
      <div className="flex justify-between text-sm"><span>TVA ({s.taxRate}%)</span><b>{formatCurrency(totals.taxAmount)}</b></div>
      <div className="flex justify-between border-t pt-3 text-lg"><span>Total</span><b>{formatCurrency(totals.total)}</b></div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="button" className="mt-3 w-full" disabled={saving} onClick={save}>{saving ? "Enregistrement…" : type === "QUOTE" ? "Enregistrer le devis" : "Enregistrer la facture"}</Button>
    </div>
  </div>;
}
