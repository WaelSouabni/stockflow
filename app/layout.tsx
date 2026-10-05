import "./globals.css";
import type { Metadata } from "next";
import { MainNav } from "@/components/layout/main-nav";

export const metadata: Metadata = {
  title: "StockFlow",
  description: "Gestion de stock et facturation",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <MainNav />
        <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </body>
    </html>
  );
}
