import { requireRole } from "@/lib/auth";
import { listUsers } from "@/services/user.service";
import { updateUserRoleAction } from "@/actions/user.actions";

export default async function UsersPage() {
  await requireRole("ADMIN");
  const users = await listUsers();

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-medium text-blue-600">Administration</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Utilisateurs</h1>
        <p className="mt-1 text-slate-500">Gérez les rôles et les accès de votre entreprise.</p>
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/70">
              <tr><th className="p-4 text-left">Utilisateur</th><th className="p-4 text-left">Email</th><th className="p-4 text-left">Rôle</th><th className="p-4 text-left">Statut</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t dark:border-slate-800">
                  <td className="p-4 font-medium">{u.name || "—"}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                  <td className="p-4">
                    <form action={updateUserRoleAction.bind(null, u.id)}>
                      <label className="sr-only" htmlFor={"role-" + u.id}>Rôle de {u.name || u.email}</label>
                      <select id={"role-" + u.id} name="role" defaultValue={u.role} onChange={e => e.currentTarget.form?.requestSubmit()} className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-950">
                        <option value="ADMIN">Admin</option><option value="MANAGER">Manager</option><option value="USER">Utilisateur</option>
                      </select>
                    </form>
                  </td>
                  <td className="p-4"><span className={u.active ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700" : "rounded-full bg-slate-100 px-2 py-1 text-xs"}>{u.active ? "Actif" : "Désactivé"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users.length && <p className="p-8 text-center text-slate-500">Aucun utilisateur.</p>}
        </div>
      </div>
    </main>
  );
}
