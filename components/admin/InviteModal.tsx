"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2, Send, CheckCircle } from "lucide-react";

interface InviteModalProps {
  onClose: () => void;
  prefillEmail?: string;
  prefillName?: string;
  requestId?: string;
}

export function InviteModal({ onClose, prefillEmail = "", prefillName = "", requestId }: InviteModalProps) {
  const [email, setEmail] = useState(prefillEmail);
  const [fullName, setFullName] = useState(prefillName);
  const [accessType, setAccessType] = useState<"paid" | "free">("paid");
  const [durationDays, setDurationDays] = useState(42);
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSend() {
    if (!email || !fullName) { setErrorMsg("Email y nombre son requeridos."); return; }
    setStatus("sending");
    setErrorMsg("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? "";

      const res = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email,
          full_name: fullName,
          access_type: accessType,
          duration_days: durationDays,
          label: label || null,
          request_id: requestId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "Error enviando invitación.");
        setStatus("error");
        return;
      }

      setStatus("done");
      setTimeout(() => { onClose(); window.location.reload(); }, 1500);
    } catch {
      setErrorMsg("Error de red. Intenta de nuevo.");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-soft w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-primary font-semibold text-dark">Enviar invitación</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg-subtle text-text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === "done" ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="font-primary font-semibold text-dark">¡Invitación enviada!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-primary font-semibold text-dark">Nombre completo *</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nombre del paciente" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-primary font-semibold text-dark">Email *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="paciente@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-primary font-semibold text-dark">Tipo de acceso</Label>
              <div className="flex gap-3">
                {(["paid", "free"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setAccessType(type)}
                    className={`flex-1 py-2.5 rounded-xl font-primary font-semibold text-sm border-2 transition-colors ${
                      accessType === type
                        ? "border-primary bg-primary text-white"
                        : "border-bg-subtle bg-bg-subtle text-text-secondary"
                    }`}
                  >
                    {type === "paid" ? "Pago" : "Gratuito"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-primary font-semibold text-dark">Duración (días)</Label>
              <Input
                type="number"
                min={1}
                max={90}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-primary font-semibold text-dark">Etiqueta (opcional)</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ej: Referido Dr. López" />
            </div>

            {accessType === "paid" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <p className="text-sm text-yellow-800 font-body leading-relaxed">
                  El link de activación se enviará automáticamente después de que el paciente complete el pago.
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-700 font-body">{errorMsg}</p>
              </div>
            )}

            <Button
              onClick={handleSend}
              disabled={status === "sending" || accessType === "paid"}
              className="w-full bg-primary hover:bg-dark text-white font-primary font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "sending" ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : accessType === "paid" ? (
                "Pendiente de pago"
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Enviar link de activación
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
