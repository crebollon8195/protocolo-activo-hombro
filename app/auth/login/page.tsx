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
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Mock auth — connect Supabase here
    setTimeout(() => {
      if (email.includes("admin")) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
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
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-xl font-primary font-semibold text-dark">
                {t("login_title")}
              </h1>
              <p className="text-sm text-text-secondary mt-1 font-body">
                {t("login_subtitle")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-primary font-semibold text-dark">
                  {t("email")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 border-bg-subtle focus:border-primary"
                    placeholder="nombre@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-primary font-semibold text-dark">
                  {t("password")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 border-bg-subtle focus:border-primary"
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

              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:text-dark font-primary font-semibold"
                >
                  {t("forgot_link")}
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-dark text-white font-primary font-semibold py-2.5 rounded-xl transition-colors"
                disabled={loading}
              >
                {loading ? "..." : t("login_btn")}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-bg-subtle" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-text-secondary font-body">o</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-bg-subtle font-primary font-semibold text-dark"
                onClick={() => router.push("/dashboard")}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t("google_btn")}
              </Button>
            </form>

            <p className="text-center text-xs text-text-secondary mt-6 font-body">
              {t("no_account")}{" "}
              <Link href="/auth/register" className="text-primary font-semibold hover:text-dark font-primary">
                {t("register")}
              </Link>
            </p>

            <p className="text-center text-xs text-text-secondary/60 mt-4 font-body">
              {t("demo_hint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
