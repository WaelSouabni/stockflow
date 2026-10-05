import { describe, expect, it } from "vitest";
import { buildMonthlyRevenue, getPeriodStart, groupMovementQuantities } from "./dashboard-calculations";

describe("dashboard calculations", () => {
  it("builds monthly paid revenue", () => {
    const now = new Date(2026, 9, 5);
    const data = buildMonthlyRevenue([
      { issueDate: new Date(2026, 8, 12), total: 100, status: "PAID" },
      { issueDate: new Date(2026, 8, 20), total: 50, status: "SENT" },
      { issueDate: new Date(2026, 9, 2), total: 200, status: "PAID" },
    ], 2, now);
    expect(data).toEqual([{ month: "2026-09", revenue: 100 }, { month: "2026-10", revenue: 200 }]);
  });

  it("returns the requested period start", () => {
    expect(getPeriodStart(30, new Date(2026, 9, 5))).toEqual(new Date(2026, 8, 6));
    expect(getPeriodStart(365, new Date(2026, 9, 5))).toEqual(new Date(2025, 9, 6));
  });

  it("groups stock movement quantities by type", () => {
    expect(groupMovementQuantities([{ type: "IN", quantity: 5 }, { type: "OUT", quantity: 2 }, { type: "IN", quantity: 3 }]))
      .toEqual([{ type: "IN", quantity: 8 }, { type: "OUT", quantity: 2 }]);
  });
});