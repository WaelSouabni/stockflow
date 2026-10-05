import "server-only";

import nodemailer from "nodemailer";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { getInvoice, updateInvoiceStatus } from "@/services/invoice.service";
import { getSettings } from "@/services/settings.service";
import { InvoiceDocument } from "@/lib/pdf/invoice-document";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Configuration email manquante : ${name}`);
  return value;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getTransporter() {
  const host = required("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("SMTP_PORT invalide.");

  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: user && password ? { user, pass: password } : undefined,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
}

export async function sendDocumentEmail(invoiceId: string) {
  const [invoice, company] = await Promise.all([getInvoice(invoiceId), getSettings()]);
  if (!invoice) throw new Error("Document introuvable.");
  if (!invoice.customer.email) throw new Error("Le client n’a pas d’adresse email.");
  if (invoice.status === "CANCELLED") throw new Error("Impossible d’envoyer un document annulé.");

  const from = required("EMAIL_FROM");
  const companyName = company?.companyName || "StockFlow";
  const isQuote = invoice.type === "QUOTE";
  const label = isQuote ? "devis" : "facture";
  const subject = `${isQuote ? "Devis" : "Facture"} ${invoice.number} — ${companyName}`;
  const customerName = invoice.customer.name;

  const pdf = React.createElement(InvoiceDocument, { invoice, company }) as unknown as React.ReactElement;
  const buffer = await renderToBuffer(pdf);

  await getTransporter().sendMail({
    from,
    to: invoice.customer.email,
    replyTo: company?.email || from,
    subject,
    text: [
      `Bonjour ${customerName},`,
      "",
      `Veuillez trouver ci-joint votre ${label} ${invoice.number}.`,
      `Montant : ${Number(invoice.total).toFixed(2)} ${invoice.currency}`,
      "",
      `Cordialement,`,
      companyName,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:auto">
        <h2 style="margin-bottom:8px">${escapeHtml(subject)}</h2>
        <p>Bonjour ${escapeHtml(customerName)},</p>
        <p>Veuillez trouver ci-joint votre ${label} <strong>${escapeHtml(invoice.number)}</strong>.</p>
        <p><strong>Montant : ${Number(invoice.total).toFixed(2)} ${escapeHtml(invoice.currency)}</strong></p>
        <p>Cordialement,<br />${escapeHtml(companyName)}</p>
      </div>
    `,
    attachments: [{ filename: `${invoice.number}.pdf`, content: buffer, contentType: "application/pdf" }],
  });

  if (invoice.status === "DRAFT") {
    await updateInvoiceStatus(invoice.id, "SENT");
  }

  return { recipient: invoice.customer.email, number: invoice.number };
}

export async function sendWelcomeEmail(to: string, name: string, companyName: string) {
  const from = required("EMAIL_FROM");
  const safeName = escapeHtml(name);
  const safeCompany = escapeHtml(companyName);

  await getTransporter().sendMail({
    from,
    to,
    subject: `Bienvenue sur StockFlow — ${companyName}`,
    text: `Bonjour ${name},\n\nVotre espace ${companyName} est prêt.\n\nBienvenue sur StockFlow.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:auto"><h2>Bienvenue sur StockFlow</h2><p>Bonjour ${safeName},</p><p>Votre espace <strong>${safeCompany}</strong> est prêt.</p><p>Bienvenue sur StockFlow.</p></div>`,
  });
}
