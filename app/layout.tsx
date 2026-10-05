import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title:"StockFlow", description:"Modern inventory and invoicing management." };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>;}