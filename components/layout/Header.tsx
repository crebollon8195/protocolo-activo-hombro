"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { Bell, Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  role?: "patient" | "admin" | "public";
}

export function Header({ role = "patient" }: HeaderProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const patientLinks = [
    { href: "/dashboard", label: t("dashboard") },
    { href: "/tracking", label: t("tracking") },
    { href: "/analytics", label: t("analytics") },
    { href: "/report", label: t("report") },
    { href: "/profile", label: t("profile") },
  ];

  const adminLinks = [
    { href: "/admin", label: t("admin") },
    { href: "/admin/patients", label: t("dashboard") },
  ];

  const links = role === "admin" ? adminLinks : role === "patient" ? patientLinks : [];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-bg-subtle shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />

          {/* Desktop nav */}
          {links.length > 0 && (
            <nav className="hidden md:flex items-center gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-primary font-semibold transition-colors ${
                    pathname === link.href
                      ? "text-primary border-b-2 border-primary pb-0.5"
                      : "text-text-secondary hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-3">
            <LanguageToggle />
            {role === "patient" && (
              <button className="relative p-2 rounded-full hover:bg-bg-subtle transition-colors">
                <Bell className="w-5 h-5 text-text-secondary" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </button>
            )}
            {role !== "public" && (
              <Link
                href="/auth/login"
                className="hidden md:block text-sm font-primary font-semibold text-text-secondary hover:text-primary transition-colors"
              >
                {t("logout")}
              </Link>
            )}
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-bg-subtle"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && links.length > 0 && (
        <div className="md:hidden border-t border-bg-subtle bg-white px-4 py-3 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`py-2 px-3 rounded-lg text-sm font-primary font-semibold transition-colors ${
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-bg-subtle"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            className="py-2 px-3 text-sm font-primary font-semibold text-text-secondary hover:bg-bg-subtle rounded-lg"
          >
            {t("logout")}
          </Link>
        </div>
      )}
    </header>
  );
}
