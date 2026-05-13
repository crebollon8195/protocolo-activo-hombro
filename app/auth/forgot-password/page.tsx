"use client";
import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/layout/Logo";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Mock email send — connect Supabase here
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  }

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col">
      <div className="flex justify-between items-center px-6 py-4">
        <Logo />
        <LanguageToggle />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-soft p-8">
            {sent ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h1 className="text-xl font-primary font-semibold text-dark mb-2">
                  Enlace enviado
                </h1>
                <p className="text-sm text-text-secondary font-body mb-6">
                  Revisa tu correo electrónico para recuperar tu contraseña.
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-primary hover:text-dark font-primary font-semibold text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("back_login")}
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-xl font-primary font-semibold text-dark">
                    {t("forgot_title")}
                  </h1>
                  <p className="text-sm text-text-secondary mt-1 font-body">
                    {t("forgot_subtitle")}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-primary font-semibold text-dark">
                      {t("email")}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      <Input type="email" className="pl-9" placeholder="nombre@email.com" required />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-dark text-white font-primary font-semibold py-2.5 rounded-xl"
                    disabled={loading}
                  >
                    {loading ? "..." : t("send_btn")}
                  </Button>
                </form>

                <div className="text-center mt-6">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:text-dark font-primary font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t("back_login")}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
