import {recordStockMovementAction} from "@/actions/stock.actions";
import {listProducts} from "@/services/product.service";
import {listStockMovements} from "@/services/stock.service";

export default async function StockPage() {
  const [products, movements] = await Promise.all([
    listProducts(),
    listStockMovements(),
  ]);

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="text-sm font-medium text-blue-600">Inventaire</p>
          <h1 className="text-3xl font-bold">Stock</h1>
          <p className="mt-1 text-slate-500">
            Entrées, sorties, ajustements et historique.
          </p>
        </header>

        <section className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold">Enregistrer un mouvement</h2>
          {products.map((product) => (
            <form
              key={product.id}
              action={recordStockMovementAction}
              className="grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-[1fr_160px_120px_1fr_110px]"
            >
              <input type="hidden" name="productId" value={product.id} />
              <div>
                <b>{product.name}</b>
                <p className="text-sm text-slate-500">
                  {product.sku} · Stock actuel : {product.stock}
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
                min="0"
                required
                className="rounded-lg border p-2"
                placeholder="Qté / stock cible"
              />
              <input
                name="reason"
                maxLength={300}
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
        </section>

        <section className="mt-10">
          <div className="mb-3">
            <h2 className="text-lg font-semibold">Historique récent</h2>
            <p className="text-sm text-slate-500">100 derniers mouvements.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Produit</th>
                  <th className="p-4 text-left">Type</th>
                  <th className="p-4 text-right">Qté</th>
                  <th className="p-4 text-left">Motif</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id} className="border-t">
                    <td className="whitespace-nowrap p-4">
                      {new Date(movement.createdAt).toLocaleString("fr-FR")}
                    </td>
                    <td className="p-4">
                      {movement.product.name}
                      <div className="text-xs text-slate-500">
                        {movement.variant?.sku || movement.product.sku}
                      </div>
                    </td>
                    <td className="p-4">{movement.type}</td>
                    <td className="p-4 text-right font-medium">
                      {movement.quantity}
                    </td>
                    <td className="p-4">{movement.reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!movements.length && (
              <p className="p-8 text-center text-slate-500">
                Aucun mouvement.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}