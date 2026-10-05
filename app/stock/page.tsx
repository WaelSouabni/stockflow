import { recordStockMovementAction } from "@/actions/stock.actions";
import { listProducts } from "@/services/product.service";

export default async function StockPage() {
  const products = await listProducts();

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Mouvements de stock</h1>
        <div className="mt-6 space-y-3">
          {products.map((product) => (
            <form
              key={product.id}
              action={recordStockMovementAction}
              className="grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-[1fr_140px_100px_1fr_100px]"
            >
              <input type="hidden" name="productId" value={product.id} />
              <div>
                <b>{product.name}</b>
                <p className="text-sm text-slate-500">
                  Stock actuel : {product.stock}
                </p>
              </div>
              <select name="type" className="rounded-lg border p-2">
                <option value="IN">Entrée</option>
                <option value="OUT">Sortie</option>
                <option value="ADJUSTMENT">Ajustement</option>
              </select>
              <input
                name="quantity"
                type="number"
                min="1"
                required
                className="rounded-lg border p-2"
                placeholder="Qté"
              />
              <input
                name="reason"
                className="rounded-lg border p-2"
                placeholder="Motif"
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-white"
              >
                Valider
              </button>
            </form>
          ))}
          {!products.length && (
            <p className="text-slate-500">Ajoutez d’abord des produits.</p>
          )}
        </div>
      </div>
    </main>
  );
}
