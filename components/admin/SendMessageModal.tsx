"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { X, Send, Loader2, CheckCircle } from "lucide-react";

interface SendMessageModalProps {
  patientEmail: string;
  patientName: string;
  onClose: () => void;
}

export function SendMessageModal({ patientEmail, patientName, onClose }: SendMessageModalProps) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSend() {
    if (!message.trim()) return;
    setStatus("sending");
    setErrorMsg("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? "";

      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ patientEmail, patientName, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "Error enviando mensaje");
        setStatus("error");
        return;
      }

      setStatus("done");
    } catch {
      setErrorMsg("Error de conexión. Intenta de nuevo.");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-subtle">
          <div>
            <h2 className="text-base font-primary font-semibold text-dark">Enviar mensaje</h2>
            <p className="text-xs text-text-secondary font-body mt-0.5">{patientName} · {patientEmail}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg-subtle transition-colors">
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {status === "done" ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-primary font-semibold text-dark mb-1">Mensaje enviado</p>
            <p className="text-sm text-text-secondary font-body mb-4">
              {patientName} recibirá tu mensaje por email.
            </p>
            <Button onClick={onClose} variant="outline" className="font-primary font-semibold">
              Cerrar
            </Button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-primary font-semibold text-dark block mb-1.5">
                Mensaje para el paciente
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                rows={5}
                className="w-full border border-input rounded-xl px-3 py-2.5 text-sm font-body resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            {(status === "error" || errorMsg) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-700 font-body">{errorMsg}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 font-primary font-semibold"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSend}
                disabled={!message.trim() || status === "sending"}
                className="flex-1 bg-primary hover:bg-dark text-white font-primary font-semibold"
              >
                {status === "sending" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Enviar
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
