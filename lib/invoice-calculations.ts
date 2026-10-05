export type InvoiceCalculationItem = { quantity: number; unitPrice: number; discount: number };

export function calculateInvoiceTotals(items: InvoiceCalculationItem[], invoiceDiscount: number, taxRate: number) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice - item.discount, 0);
  const taxable = Math.max(0, subtotal - invoiceDiscount);
  const tax = taxable * taxRate / 100;
  const total = taxable + tax;
  return { subtotal, taxable, tax, total };
}
