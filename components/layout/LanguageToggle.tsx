"use client";
import { useTranslations } from "next-intl";

export function LanguageToggle() {
  const t = useTranslations("common");

  function toggleLocale() {
    const current = document.cookie.match(/locale=([^;]+)/)?.[1] || "es";
    const next = current === "es" ? "en" : "es";
    document.cookie = `locale=${next};path=/;max-age=31536000`;
    window.location.reload();
  }

  return (
    <button
      onClick={toggleLocale}
      className="text-sm font-semibold text-primary hover:text-dark transition-colors px-3 py-1 border border-primary/30 rounded-full hover:bg-primary/5"
    >
      {t("lang_toggle")}
    </button>
  );
}
