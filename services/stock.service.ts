import { prisma } from "@/lib/prisma";
import { calculateNextStock, calculateStockDelta } from "@/lib/stock-calculations";

export async function recordStockMovement(data: { productId: string; type: "IN" | "OUT" | "ADJUSTMENT"; quantity: number; reason?: string }) {
  return prisma.$transaction(async tx => {
    const p = await tx.product.findUniqueOrThrow({ where: { id: data.productId } });
    const next = calculateNextStock(data.type, data.quantity, p.stock);
    const result = await tx.product.updateMany({
      where: { id: p.id, stock: p.stock },
      data: { stock: next },
    });
    if (result.count !== 1) throw new Error("Le stock a été modifié entre-temps. Veuillez réessayer.");
    return tx.stockMovement.create({
      data: {
        productId: p.id,
        type: data.type,
        quantity: Math.abs(calculateStockDelta(data.type, data.quantity, p.stock)),
        reason: data.reason || undefined,
      },
    });
  });
}

export async function listStockMovements() {
  return prisma.stockMovement.findMany({
    include: { product: { select: { name: true, sku: true } }, variant: { select: { name: true, sku: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
