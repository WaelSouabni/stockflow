import { describe, expect, it } from "vitest";
import { calculateInvoiceTotals } from "@/lib/invoice-calculations";

describe("calculateInvoiceTotals", () => {
  it("calculates subtotal, discount, tax and total", () => {
    const result = calculateInvoiceTotals([
      { quantity: 2, unitPrice: 100, discount: 10 },
      { quantity: 1, unitPrice: 50, discount: 0 },
    ], 20, 20);
    expect(result.subtotal).toBe(240);
    expect(result.taxable).toBe(220);
    expect(result.tax).toBe(44);
    expect(result.total).toBe(264);
  });
  it("never makes taxable amount negative", () => {
    const result = calculateInvoiceTotals([{ quantity: 1, unitPrice: 10, discount: 0 }], 50, 20);
    expect(result.taxable).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.total).toBe(0);
  });
  it("supports zero VAT", () => {
    const result = calculateInvoiceTotals([{ quantity: 2, unitPrice: 100, discount: 0 }], 0, 0);
    expect(result.total).toBe(200);
  });
});
