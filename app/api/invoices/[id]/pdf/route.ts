import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { getSession } from "@/lib/auth";
import { getInvoice } from "@/services/invoice.service";
import { getSettings } from "@/services/settings.service";
import { InvoiceDocument } from "@/lib/pdf/invoice-document";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!(await getSession())) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const [invoice, company] = await Promise.all([getInvoice(params.id), getSettings()]);
  if (!invoice) return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  const document = React.createElement(InvoiceDocument, { invoice, company }) as unknown as React.ReactElement;
  const buffer = await renderToBuffer(document);
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="${invoice.number}.pdf"` },
  });
}
