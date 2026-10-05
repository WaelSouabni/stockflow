import "./globals.css";
import type { Metadata } from "next";
import { MainNav } from "@/components/layout/main-nav";

export const metadata: Metadata = {
  title: { default: "StockFlow", template: "%s | StockFlow" },
  description: "Gestion de stock et facturation",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <MainNav />
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
