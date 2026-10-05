"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { logoutAction } from "@/actions/auth.actions";

type Props = { session: { role: "ADMIN" | "MANAGER" | "USER"; name?: string; email: string } | null };

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Produits" },
  { href: "/stock", label: "Stock" },
  { href: "/customers", label: "Clients" },
  { href: "/invoices", label: "Factures" },
  { href: "/quotes", label: "Devis" },
  { href: "/settings", label: "Entreprise", roles: ["ADMIN"] },
  { href: "/settings/users", label: "Utilisateurs", roles: ["ADMIN"] },
] as const;

export function MainNavClient({ session }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const visibleLinks = links.filter(link => !("roles" in link) || !link.roles || (session && link.roles.some(role => role === session.role)));

  return (
    <nav aria-label="Navigation principale" className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href={session ? "/dashboard" : "/login"} aria-label="StockFlow - Accueil" className="shrink-0 text-lg font-bold tracking-tight" onClick={() => setOpen(false)}>StockFlow</Link>
        {session && <span className="hidden truncate text-sm text-slate-500 md:block">{session.name || session.email}</span>}
        <div className="ml-auto hidden items-center gap-1 lg:flex">
          {visibleLinks.map(link => (
            <Link key={link.href} href={link.href} className={"rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 " + (pathname === link.href ? "bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white" : "text-slate-600 dark:text-slate-300")}>{link.label}</Link>
          ))}
          <ThemeToggle />
          {session && <form action={logoutAction}><button type="submit" className="rounded-lg border px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Déconnexion</button></form>}
        </div>
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          {session && <form action={logoutAction}><button type="submit" className="hidden rounded-lg border px-3 py-2 text-sm font-medium sm:block">Déconnexion</button></form>}
          <button type="button" aria-expanded={open} aria-controls="stockflow-mobile-nav" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setOpen(value => !value)} className="rounded-lg border p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && session && (
        <div id="stockflow-mobile-nav" className="border-t px-4 py-3 lg:hidden dark:border-slate-800">
          <div className="mx-auto grid max-w-7xl gap-1 sm:grid-cols-2">
            {visibleLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={"rounded-lg px-3 py-2.5 text-sm font-medium " + (pathname === link.href ? "bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900")}>{link.label}</Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
