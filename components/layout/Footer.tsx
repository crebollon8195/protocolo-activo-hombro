import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("landing");

  return (
    <footer className="bg-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold text-sm font-primary">
                CR
              </div>
              <span className="font-primary font-semibold text-white text-base">
                Dr. Carlos Rebollón
              </span>
            </div>
            <p className="text-sm text-white/60 font-body">{t("footer_tagline")}</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1">
            <a
              href="https://drcarlosrebollon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-light-blue hover:text-white transition-colors font-body"
            >
              drcarlosrebollon.com
            </a>
            <p className="text-xs text-white/40 font-body">
              © {new Date().getFullYear()} Dr. Carlos Rebollón. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
