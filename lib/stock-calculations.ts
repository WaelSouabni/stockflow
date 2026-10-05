export type StockMovementType = "IN" | "OUT" | "ADJUSTMENT";

export function calculateStockDelta(type: StockMovementType, quantity: number, currentStock: number) {
  if (quantity < 0) throw new Error("La quantité doit être positive.");
  if (type === "IN") return quantity;
  if (type === "OUT") return -quantity;
  return quantity - currentStock;
}

export function calculateNextStock(type: StockMovementType, quantity: number, currentStock: number) {
  const nextStock = currentStock + calculateStockDelta(type, quantity, currentStock);
  if (nextStock < 0) throw new Error("Stock insuffisant");
  return nextStock;
}
