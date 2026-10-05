import { describe, expect, it } from "vitest";
import { INVOICE_STATUS_TRANSITIONS } from "@/services/invoice.service";

describe("invoice status transitions", () => {
  it("allows the expected lifecycle", () => {
    expect(INVOICE_STATUS_TRANSITIONS.DRAFT).toEqual(["SENT", "CANCELLED"]);
    expect(INVOICE_STATUS_TRANSITIONS.SENT).toEqual(["PAID", "OVERDUE", "CANCELLED"]);
    expect(INVOICE_STATUS_TRANSITIONS.OVERDUE).toEqual(["PAID", "CANCELLED"]);
  });

  it("keeps paid and cancelled documents terminal", () => {
    expect(INVOICE_STATUS_TRANSITIONS.PAID).toEqual([]);
    expect(INVOICE_STATUS_TRANSITIONS.CANCELLED).toEqual([]);
  });

  it("does not allow reverting sent invoices to draft", () => {
    expect(INVOICE_STATUS_TRANSITIONS.SENT).not.toContain("DRAFT");
  });
});
