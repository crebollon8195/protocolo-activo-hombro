"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/layout/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Lock, Loader2 } from "lucide-react";

function ActivateContent() {
  const params = useSearchParams();
  const token = params.get("token");

  const [status, setStatus] = useState<"checking" | "valid" | "invalid" | "creating" | "done">("checking");
  const [invitation, setInvitation] = useState<{ email: string; access_type: string } | null>(null);
  const [invalidReason, setInvalidReason] = useState("Este link ya fue usado, expiró, o no es válido.");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    checkToken();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function checkToken() {
    // Read invitation client-side just to pre-fill the email and validate UX
    const { data, error: err } = await supabase
      .from("invitations")
      .select("email, access_type, used, expires_at")
      .eq("token", token!)
      .single();

    if (err || !data) { setInvalidReason("Token no encontrado."); setStatus("invalid"); return; }
    if (data.used) { setInvalidReason("Este link ya fue usado."); setStatus("invalid"); return; }
    if (new Date(data.expires_at) < new Date()) { setInvalidReason("Este link ha expirado. Contacta al doctor para recibir uno nuevo."); setStatus("invalid"); return; }

    setInvitation({ email: data.email, access_type: data.access_type });
    setStatus("valid");
  }

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    if (password !== confirmPassword) { setError("Las contraseñas no coinciden."); return; }

    setStatus("creating");

    // API route handles: create/update auth user, upsert profile, mark invitation used
    const res = await fetch("/api/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error || "Error activando cuenta. Intenta de nuevo.");
      setStatus("valid");
      return;
    }

    // Immediately sign in so the session cookie is established
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: result.email,
      password,
    });

    if (signInError) {
      setError("Cuenta creada pero no se pudo iniciar sesión. Ve a /auth/login.");
      setStatus("valid");
      return;
    }

    setStatus("done");

    // Check role to decide where to send them
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .single();

    setTimeout(() => {
      window.location.href = profile?.role === "admin" ? "/admin" : "/onboarding";
    }, 1800);
  }

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col">
      <div className="px-6 py-4">
        <Logo />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-soft p-8">

            {status === "checking" && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                <p className="text-sm text-text-secondary font-body">Verificando tu invitación...</p>
              </div>
            )}

            {status === "invalid" && (
              <div className="text-center">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <h1 className="text-xl font-primary font-semibold text-dark mb-2">Link inválido o expirado</h1>
                <p className="text-sm text-text-secondary font-body mb-4">{invalidReason}</p>
                <p className="text-sm text-text-secondary font-body">
                  Contacta a{" "}
                  <a href="mailto:info@drcarlosrebollon.com" className="text-primary font-semibold">
                    info@drcarlosrebollon.com
                  </a>
                </p>
              </div>
            )}

            {(status === "valid" || status === "creating") && invitation && (
              <>
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-xl font-primary font-semibold text-dark">Activar tu cuenta</h1>
                  <p className="text-sm text-text-secondary font-body mt-1">
                    Crea una contraseña para acceder con{" "}
                    <strong className="text-dark">{invitation.email}</strong>
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-red-700 font-body">{error}</p>
                  </div>
                )}

                <form onSubmit={handleActivate} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-primary font-semibold text-dark">Contraseña</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-primary font-semibold text-dark">Confirmar contraseña</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-dark text-white font-primary font-semibold py-2.5 rounded-xl"
                    disabled={status === "creating"}
                  >
                    {status === "creating"
                      ? <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      : "Activar mi cuenta"}
                  </Button>
                </form>
              </>
            )}

            {status === "done" && (
              <div className="text-center">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h1 className="text-xl font-primary font-semibold text-dark mb-2">¡Cuenta activada!</h1>
                <p className="text-sm text-text-secondary font-body">Redirigiendo al programa...</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ActivateContent />
    </Suspense>
  );
}
