"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/layout/Logo";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Mock registration — connect Supabase here
    setTimeout(() => {
      router.push("/onboarding");
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
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-xl font-primary font-semibold text-dark">
                {t("register_title")}
              </h1>
              <p className="text-sm text-text-secondary mt-1 font-body">
                {t("register_subtitle")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-primary font-semibold text-dark">
                  {t("name")}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <Input className="pl-9" placeholder="María González" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-primary font-semibold text-dark">
                  {t("email")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <Input type="email" className="pl-9" placeholder="nombre@email.com" required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-primary font-semibold text-dark">
                  {t("password")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <Input
                    type={showPass ? "text" : "password"}
                    className="pl-9 pr-9"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-dark"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-dark text-white font-primary font-semibold py-2.5 rounded-xl"
                disabled={loading}
              >
                {loading ? "..." : t("register_btn")}
              </Button>
            </form>

            <p className="text-center text-xs text-text-secondary mt-6 font-body">
              {t("has_account")}{" "}
              <Link href="/auth/login" className="text-primary font-semibold hover:text-dark font-primary">
                {t("login")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
