import Link from "next/link";
import { loginAction } from "@/actions/auth.actions";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <p className="text-sm font-semibold text-blue-600">StockFlow</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Connexion</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Accédez à votre espace de gestion.</p>
        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">Email professionnel
            <input name="email" type="email" required maxLength={254} autoComplete="email" className="mt-1 w-full rounded-lg border bg-transparent p-3" />
          </label>
          <label className="block text-sm font-medium">Mot de passe
            <input name="password" type="password" required minLength={8} maxLength={128} autoComplete="current-password" className="mt-1 w-full rounded-lg border bg-transparent p-3" />
          </label>
          <button className="w-full rounded-lg bg-slate-900 p-3 font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">Se connecter</button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">Pas encore de compte ? <Link href="/register" className="font-medium text-blue-600 hover:underline">Créer mon espace</Link></p>
      </section>
    </main>
  );
}
