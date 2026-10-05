"use client";

import { useState, useTransition } from "react";
import { sendDocumentEmailAction } from "@/actions/email.actions";

export function SendDocumentEmailButton({ id, recipient }: { id: string; recipient?: string | null }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function send() {
    setMessage("");
    startTransition(async () => {
      try {
        const result = await sendDocumentEmailAction(id);
        setMessage(`Envoyé à ${result.recipient}`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Envoi impossible.");
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button type="button" disabled={pending || !recipient} onClick={send} title={recipient ? `Envoyer à ${recipient}` : "Le client n’a pas d’email"} className="rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800">
        {pending ? "Envoi…" : "Email"}
      </button>
      {message && <span aria-live="polite" className="text-xs text-slate-500">{message}</span>}
    </div>
  );
}
