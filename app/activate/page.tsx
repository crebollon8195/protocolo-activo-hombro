"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/layout/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Lock, Loader2 } from "lucide-react";

function ActivateContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [status, setStatus] = useState<"checking" | "valid" | "invalid" | "creating" | "done">("checking");
  const [invitation, setInvitation] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    checkToken();
  }, [token]);

  async function checkToken() {
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", token!)
      .single();

    if (error || !data) { setStatus("invalid"); return; }
    if (data.used) { setStatus("invalid"); return; }
    if (new Date(data.expires_at) < new Date()) { setStatus("invalid"); return; }

    setInvitation(data);
    setStatus("valid");
  }

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    if (password !== confirmPassword) { setError("Las contraseñas no coinciden."); return; }

    setStatus("creating");

    // Create user in Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: invitation.email,
      password,
    });

    if (signUpError || !authData.user) {
      setError(signUpError?.message || "Error creando cuenta. Intenta de nuevo.");
      setStatus("valid");
      return;
    }

    // Create profile
    await supabase.from("profiles").insert({
      id: authData.user.id,
      email: invitation.email,
      full_name: "",
      role: "patient",
      access_active: true,
      access_type: invitation.access_type,
    });

    // Mark token as used
    await supabase.from("invitations").update({ used: true }).eq("token", token!);

    setStatus("done");
    setTimeout(() => router.push("/onboarding"), 2000);
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
                <p className="text-sm text-text-secondary font-body mb-4">
                  Este link ya fue usado, expiró, o no es válido.
                </p>
                <p className="text-sm text-text-secondary font-body">
                  Contacta a{" "}
                  <a href="mailto:info@drcarlosrebollon.com" className="text-primary font-semibold">
                    info@drcarlosrebollon.com
                  </a>
                </p>
              </div>
            )}

            {(status === "valid" || status === "creating") && (
              <>
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-xl font-primary font-semibold text-dark">Activar tu cuenta</h1>
                  <p className="text-sm text-text-secondary font-body mt-1">
                    Crea una contraseña para <strong>{invitation?.email}</strong>
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
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-primary font-semibold text-dark">Confirmar contraseña</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" required />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-dark text-white font-primary font-semibold py-2.5 rounded-xl" disabled={status === "creating"}>
                    {status === "creating" ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Activar mi cuenta"}
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
                <p className="text-sm text-text-secondary font-body">Redirigiendo a tu perfil...</p>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ActivateContent />
    </Suspense>
  );
}
