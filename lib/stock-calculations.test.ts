import { describe, expect, it } from "vitest";
import { calculateNextStock, calculateStockDelta } from "./stock-calculations";

describe("stock calculations", () => {
  it("adds incoming stock", () => expect(calculateNextStock("IN", 5, 10)).toBe(15));
  it("removes outgoing stock", () => expect(calculateNextStock("OUT", 4, 10)).toBe(6));
  it("adjusts stock to the requested quantity", () => expect(calculateStockDelta("ADJUSTMENT", 7, 10)).toBe(-3));
  it("rejects an outgoing movement larger than stock", () => expect(() => calculateNextStock("OUT", 11, 10)).toThrow("Stock insuffisant"));
  it("rejects negative quantities", () => expect(() => calculateStockDelta("IN", -1, 10)).toThrow("positive"));
});
