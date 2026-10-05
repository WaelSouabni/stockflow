import { describe, expect, it } from "vitest";
import { calculateInvoiceTotals } from "./invoice-calculations";

describe("calculateInvoiceTotals", () => {
  it("calculates subtotal, tax and total", () => {
    expect(calculateInvoiceTotals([
      { quantity: 2, unitPrice: 100, discount: 10 },
      { quantity: 1, unitPrice: 50, discount: 0 },
    ], 20, 20)).toEqual({ subtotal: 230, taxable: 210, tax: 42, total: 252 });
  });

  it("never creates a negative taxable amount", () => {
    expect(calculateInvoiceTotals([{ quantity: 1, unitPrice: 50, discount: 0 }], 100, 20)).toEqual({ subtotal: 50, taxable: 0, tax: 0, total: 0 });
  });

  it("supports zero VAT", () => {
    expect(calculateInvoiceTotals([{ quantity: 3, unitPrice: 25, discount: 5 }], 0, 0)).toEqual({ subtotal: 70, taxable: 70, tax: 0, total: 70 });
  });
});
