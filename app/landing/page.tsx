import { useTranslations } from "next-intl";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Footer } from "@/components/layout/Footer";
import { AccessRequestForm } from "@/components/forms/AccessRequestForm";
import { FadeIn } from "@/components/ui/FadeIn";
import {
  Activity, Eye, Bell, FileText,
  Zap, Maximize2, Heart,
  Clock, TrendingDown, AlertTriangle,
  ChevronRight, ArrowDown, Shield, Check, X,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   Shared CTA button class — full width mobile, max-w-xs centered on desktop
───────────────────────────────────────────────────────────────────────────── */
const ctaPrimary =
  "w-full sm:max-w-xs sm:mx-auto flex items-center justify-center gap-2 bg-[#0170B9] hover:bg-[#0159a0] text-white font-primary font-bold py-4 px-6 rounded-xl text-base transition-colors shadow-lg";
const ctaWhite =
  "w-full sm:max-w-xs sm:mx-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#0170B9] font-primary font-bold py-4 px-6 rounded-xl text-base transition-colors shadow-lg";
const ctaGhost =
  "w-full sm:max-w-xs sm:mx-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/18 border border-white/20 text-white font-primary font-semibold py-4 px-6 rounded-xl text-base transition-colors";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <ReframeSection />
        <CompareSection />
        <HowItWorksSection />
        <DiffOneSection />
        <DiffTwoSection />
        <DiffThreeSection />
        <DiffFourSection />
        <TransformationSection />
        <AuthoritySection />
        <PricingSection />
        <FormSection />
      </main>
      <Footer />
    </div>
  );
}

/* ── HEADER — unchanged ───────────────────────────────────────────────────── */
function LandingHeader() {
  const t = useTranslations("nav");
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-bg-subtle shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Logo />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link
            href="/auth/login"
            className="text-sm font-primary font-semibold text-text-secondary hover:text-primary transition-colors hidden sm:block"
          >
            {t("login")}
          </Link>
          <a
            href="#solicitar-acceso"
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-dark text-white font-primary font-semibold text-sm px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
          >
            Solicitar acceso
          </a>
        </div>
      </div>
    </header>
  );
}

/* ── S1. HERO ─────────────────────────────────────────────────────────────── */
function HeroSection() {
  const t = useTranslations("landing");
  return (
    <section
      className="text-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 60%, #314C8B 100%)" }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <FadeIn>
          {/* Eyebrow */}
          <p className="font-primary text-xs font-bold tracking-widest uppercase text-[#8ECAEE] mb-8">
            {t("hero_eyebrow")}
          </p>

          {/* H1 */}
          <h1 className="font-display font-bold leading-tight mb-6 text-white text-3xl sm:text-4xl lg:text-5xl">
            {t("hero_h1a")}
            <br />
            <span className="italic text-[#8ECAEE]">{t("hero_h1b")}</span>
          </h1>

          {/* Sub */}
          <p className="font-primary text-base sm:text-lg text-white/65 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("hero_sub")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-20 max-w-md mx-auto sm:max-w-none">
            <a href="#solicitar-acceso" className={ctaPrimary}>
              {t("hero_cta1")}
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </a>
            <a href="#how-it-works" className={ctaGhost}>
              {t("hero_cta_see")}
              <ArrowDown className="w-4 h-4 flex-shrink-0" />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto border-t border-white/10 pt-10">
            {[
              { num: "6",     label: t("hero_stat1_label") },
              { num: "42",   label: t("hero_stat2_label") },
              { num: "100%", label: t("hero_stat3_label") },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <div className="font-display text-2xl sm:text-3xl font-bold text-white">{num}</div>
                <div className="font-primary text-xs text-white/45 mt-1.5 leading-snug">{label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ── S2. THE REAL PROBLEM ─────────────────────────────────────────────────── */
function ReframeSection() {
  const t = useTranslations("landing");
  const painIcons = [Clock, TrendingDown, AlertTriangle];
  const painKeys = ["prob_pain1", "prob_pain2", "prob_pain3"] as const;

  return (
    <section className="bg-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p className="font-primary text-xs font-bold tracking-widest uppercase text-[#0170B9] mb-4 text-center">
            {t("prob_label")}
          </p>
          <h2 className="font-display font-bold text-[#0a1628] leading-tight mb-8 text-center text-2xl sm:text-3xl lg:text-4xl">
            {t("prob_h2")}
          </h2>
          <p className="font-primary text-base text-text-secondary leading-relaxed max-w-2xl mx-auto mb-12 text-center">
            {t("prob_body_pre")}{" "}
            <span className="text-dark font-semibold">{t("prob_body_bold")}</span>
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {painKeys.map((key, i) => {
            const Icon = painIcons[i];
            return (
              <FadeIn key={key} delay={i * 100}>
                <div className="bg-[#F5F7FA] rounded-2xl p-6 border border-[#EBEEF3] h-full">
                  <div className="w-10 h-10 rounded-xl bg-[#0170B9]/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#0170B9]" />
                  </div>
                  <p className="font-primary text-sm font-semibold text-dark leading-relaxed">
                    {t(key)}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── S3. OLD vs NEW ───────────────────────────────────────────────────────── */
function CompareSection() {
  const t = useTranslations("landing");
  const oldItems = ["cmp_old1","cmp_old2","cmp_old3","cmp_old4","cmp_old5"] as const;
  const newItems = ["cmp_new1","cmp_new2","cmp_new3","cmp_new4","cmp_new5"] as const;

  return (
    <section className="bg-[#F5F7FA] py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p className="font-primary text-xs font-bold tracking-widest uppercase text-[#0170B9] mb-4 text-center">
            {t("cmp_label")}
          </p>
          <h2 className="font-display font-bold text-[#0a1628] leading-tight mb-12 text-center text-2xl sm:text-3xl lg:text-4xl">
            {t("cmp_h2a")}
            <br className="hidden sm:block" />
            <span className="text-[#0170B9]"> {t("cmp_h2b")}</span>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {/* Old model */}
          <FadeIn delay={0}>
            <div className="bg-white rounded-2xl p-7 border border-[#EBEEF3] h-full">
              <p className="font-primary text-xs font-bold text-text-secondary uppercase tracking-widest mb-6">
                {t("cmp_old_title")}
              </p>
              <ul className="space-y-3.5">
                {oldItems.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <X className="w-4 h-4 text-[#808285] flex-shrink-0 mt-0.5" />
                    <span className="font-primary text-sm text-text-secondary">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* New model */}
          <FadeIn delay={100}>
            <div
              className="rounded-2xl p-7 border-2 h-full"
              style={{ background: "#EBF4FC", borderColor: "#0170B9" }}
            >
              <p
                className="font-primary text-xs font-bold uppercase tracking-widest mb-6"
                style={{ color: "#0170B9" }}
              >
                {t("cmp_new_title")}
              </p>
              <ul className="space-y-3.5">
                {newItems.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#0170B9" }} />
                    <span className="font-primary text-sm font-semibold text-dark">{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={200}>
          <div className="flex justify-center">
            <a href="#solicitar-acceso" className={ctaPrimary}>
              {t("cmp_cta")}
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ── S4. HOW IT WORKS ────────────────────────────────────────────────────── */
function HowItWorksSection() {
  const t = useTranslations("landing");
  const steps = [
    { num: "01", titleKey: "how2_s1_title", descKey: "how2_s1_desc" },
    { num: "02", titleKey: "how2_s2_title", descKey: "how2_s2_desc" },
    { num: "03", titleKey: "how2_s3_title", descKey: "how2_s3_desc" },
    { num: "04", titleKey: "how2_s4_title", descKey: "how2_s4_desc" },
  ] as const;

  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p className="font-primary text-xs font-bold tracking-widest uppercase text-[#0170B9] mb-4 text-center">
            {t("how2_label")}
          </p>
          <h2 className="font-display font-bold text-[#0a1628] leading-tight mb-14 text-center text-2xl sm:text-3xl lg:text-4xl">
            {t("how2_h2")}
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ num, titleKey, descKey }, i) => (
            <FadeIn key={num} delay={i * 80}>
              <div className="flex flex-col">
                <div
                  className="font-display font-bold leading-none mb-4"
                  style={{ fontSize: "3.5rem", color: "#0170B9", opacity: 0.15 }}
                >
                  {num}
                </div>
                <h3 className="font-primary font-bold text-dark text-sm mb-2 leading-snug">
                  {t(titleKey)}
                </h3>
                <p className="font-primary text-xs text-text-secondary leading-relaxed">
                  {t(descKey)}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── S5. DIFFERENTIATOR 1 — "Mejorar vs saber" ────────────────────────────── */
function DiffOneSection() {
  const t = useTranslations("landing");
  return (
    <section className="bg-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-[#EBEEF3]">
      <FadeIn>
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-display italic text-[#0a1628] leading-relaxed text-xl sm:text-2xl lg:text-3xl mb-6">
            &ldquo;{t("diff1_q1")}
          </p>
          <p className="font-primary text-base sm:text-lg text-text-secondary leading-relaxed mb-2">
            {t("diff1_q2")}
          </p>
          <p className="font-primary text-base sm:text-lg text-text-secondary leading-relaxed mb-8">
            {t("diff1_q3")}&rdquo;
          </p>
          <div className="w-12 h-px bg-[#0170B9] mx-auto mb-8" />
          <p className="font-primary font-semibold text-[#314C8B] text-base sm:text-lg leading-relaxed">
            {t("diff1_q4")}
          </p>
        </div>
      </FadeIn>
    </section>
  );
}

/* ── S6. DIFFERENTIATOR 2 — "La escena de las 11pm" ─────────────────────── */
function DiffTwoSection() {
  const t = useTranslations("landing");
  return (
    <section
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8"
      style={{ background: "#0a1628" }}
    >
      <div className="max-w-2xl mx-auto">
        <FadeIn>
          <h2 className="font-display font-bold text-white mb-10 text-2xl sm:text-3xl lg:text-4xl">
            {t("diff2_h2")}
          </h2>

          <div className="space-y-2 mb-10">
            <p className="font-primary text-base sm:text-lg text-white/85 leading-relaxed">{t("diff2_l1")}</p>
            <p className="font-primary text-base sm:text-lg text-white/85 leading-relaxed">{t("diff2_l2")}</p>
            <p className="font-primary text-base sm:text-lg text-white/85 leading-relaxed">{t("diff2_l3")}</p>
          </div>

          <div className="space-y-1 mb-3">
            <p className="font-primary text-sm text-white/40 uppercase tracking-wider">{t("diff2_l4")}</p>
            <p className="font-primary text-base sm:text-lg text-white/60 leading-relaxed pl-4 border-l-2 border-white/15">
              {t("diff2_l5")}
            </p>
          </div>

          <div className="space-y-1 mb-12">
            <p className="font-primary text-sm text-[#8ECAEE] uppercase tracking-wider font-semibold">{t("diff2_l6")}</p>
            <p className="font-primary text-base sm:text-lg text-white leading-relaxed pl-4 border-l-2 border-[#0170B9]">
              {t("diff2_l7")}
            </p>
            <p className="font-primary text-base sm:text-lg text-white leading-relaxed pl-4 border-l-2 border-[#0170B9]">
              {t("diff2_l8")}
            </p>
          </div>

          <p className="font-primary text-sm text-white/50 mb-1">{t("diff2_l9")}</p>
          <p className="font-display italic text-[#8ECAEE] text-2xl sm:text-3xl font-bold mb-12">
            {t("diff2_l10")}
          </p>

          <a href="#solicitar-acceso" className={ctaWhite}>
            {t("diff2_cta")}
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

/* ── S7. DIFFERENTIATOR 3 — "No compras tecnología" ──────────────────────── */
function DiffThreeSection() {
  const t = useTranslations("landing");
  const cards = [
    { key: "diff3_c1", Icon: Activity },
    { key: "diff3_c2", Icon: Eye },
    { key: "diff3_c3", Icon: Bell },
    { key: "diff3_c4", Icon: FileText },
  ] as const;

  return (
    <section className="bg-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p className="font-primary text-xs font-bold tracking-widest uppercase text-[#0170B9] mb-4 text-center">
            {t("diff3_label")}
          </p>
          <h2 className="font-display font-bold text-[#0a1628] leading-tight mb-6 text-center text-2xl sm:text-3xl lg:text-4xl">
            {t("diff3_h2a")}
            <br />
            {t("diff3_h2b")}
          </h2>
          <div className="max-w-xl mx-auto text-center mb-14 space-y-3">
            <p className="font-primary text-base text-text-secondary">{t("diff3_b1")}</p>
            <p className="font-primary text-base text-dark font-semibold">{t("diff3_b2")}</p>
            <p className="font-primary text-sm text-text-secondary">{t("diff3_b3")}</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map(({ key, Icon }, i) => (
            <FadeIn key={key} delay={i * 80}>
              <div className="bg-[#F5F7FA] rounded-2xl p-6 border border-[#EBEEF3] h-full">
                <div className="w-10 h-10 rounded-xl bg-[#0170B9]/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#0170B9]" />
                </div>
                <h3 className="font-primary font-bold text-dark text-sm mb-2">
                  {t(`${key}_title` as any)}
                </h3>
                <p className="font-primary text-xs text-text-secondary leading-relaxed">
                  {t(`${key}_body` as any)}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── S8. DIFFERENTIATOR 4 — "La alerta que nadie más tiene" ──────────────── */
function DiffFourSection() {
  const t = useTranslations("landing");
  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8" style={{ background: "#EBF4FF" }}>
      <div className="max-w-3xl mx-auto text-center">
        <FadeIn>
          <h2 className="font-display font-bold text-[#0a1628] leading-tight mb-8 text-2xl sm:text-3xl lg:text-4xl">
            {t("diff4_h2")}
          </h2>
          <div className="space-y-3 mb-10 max-w-xl mx-auto">
            <p className="font-primary text-base text-dark leading-relaxed">{t("diff4_b1")}</p>
            <p className="font-primary text-lg font-bold text-[#0170B9]">{t("diff4_b2")}</p>
            <p className="font-primary text-base text-text-secondary leading-relaxed">{t("diff4_b3")}</p>
            <p className="font-primary text-base font-semibold text-dark leading-relaxed">{t("diff4_b4")}</p>
          </div>
          <div className="flex justify-center">
            <a href="#solicitar-acceso" className={ctaPrimary}>
              {t("diff4_cta")}
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ── S9. TRANSFORMATION ──────────────────────────────────────────────────── */
function TransformationSection() {
  const t = useTranslations("landing");
  const cards = [
    { key: "trans_c1", Icon: Zap },
    { key: "trans_c2", Icon: Maximize2 },
    { key: "trans_c3", Icon: Heart },
  ] as const;

  return (
    <section className="bg-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-[#EBEEF3]">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p className="font-primary text-xs font-bold tracking-widest uppercase text-[#0170B9] mb-4 text-center">
            {t("trans_label")}
          </p>
          <h2 className="font-display font-bold text-[#0a1628] leading-tight mb-12 text-center text-2xl sm:text-3xl lg:text-4xl">
            {t("trans_h2")}
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {cards.map(({ key, Icon }, i) => (
            <FadeIn key={key} delay={i * 100}>
              <div
                className="rounded-2xl p-7 border-2 h-full"
                style={{ background: "#EBF4FC", borderColor: "#0170B9" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "#0170B9" }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-display italic font-bold text-[#314C8B] text-base leading-snug">
                  {t(key)}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── S10. AUTHORITY ──────────────────────────────────────────────────────── */
function AuthoritySection() {
  const t = useTranslations("landing");
  const ptKeys = ["auth_pt1", "auth_pt2", "auth_pt3"] as const;

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8" style={{ background: "#0a1628" }}>
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          {/* Avatar + name */}
          <div className="flex flex-col items-center text-center mb-10">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-xl text-white mb-5"
              style={{ background: "#314C8B" }}
            >
              CR
            </div>
            <h2
              className="font-display font-bold text-white text-2xl sm:text-3xl mb-1 whitespace-nowrap"
            >
              Dr. Carlos Rebollón
            </h2>
            <p className="font-primary text-sm text-white/55">{t("auth_subtitle")}</p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {(["auth_stat1","auth_stat2","auth_stat3"] as const).map((key) => (
              <div
                key={key}
                className="bg-white/8 border border-white/10 rounded-full px-5 py-2 font-primary text-sm text-white/80 font-semibold"
              >
                {t(key)}
              </div>
            ))}
          </div>

          {/* Bold statement */}
          <blockquote className="border-l-4 border-[#0170B9] pl-5 mb-10 max-w-2xl mx-auto">
            <p className="font-primary font-semibold text-white text-base leading-relaxed">
              {t("auth_bold")}
            </p>
          </blockquote>

          {/* Authority points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {ptKeys.map((key) => (
              <div key={key} className="flex items-start gap-3 bg-white/6 rounded-xl p-4">
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                  style={{ background: "#0170B9" }}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
                <p className="font-primary text-sm text-white/75 leading-relaxed">{t(key)}</p>
              </div>
            ))}
          </div>

          {/* Link + CTA */}
          <div className="flex flex-col items-center gap-5">
            <a
              href="https://drcarlosrebollon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-primary text-sm font-semibold text-[#8ECAEE] hover:underline"
            >
              drcarlosrebollon.com →
            </a>
            <a href="#solicitar-acceso" className={ctaWhite}>
              {t("auth_cta")}
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ── S11. PRICING ────────────────────────────────────────────────────────── */
function PricingSection() {
  const t = useTranslations("landing");
  const sharedFeatures = ["price_f1","price_f2","price_f3","price_f4","price_f5"] as const;
  const trackerFeatures = ["price_t1","price_t2","price_t3","price_t4"] as const;

  return (
    <section className="bg-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p className="font-primary text-xs font-bold tracking-widest uppercase text-[#0170B9] mb-4 text-center">
            {t("price_label")}
          </p>
          <h2 className="font-display font-bold text-[#0a1628] leading-tight mb-14 text-center text-2xl sm:text-3xl lg:text-4xl">
            {t("price_h2a")}
            <br />
            {t("price_h2b")}
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Basic */}
          <FadeIn delay={0}>
            <div className="bg-[#F5F7FA] rounded-2xl p-7 border border-[#EBEEF3] h-full flex flex-col">
              <p className="font-primary text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                {t("price_basic_title")}
              </p>
              <p className="font-display font-bold text-[#314C8B] text-3xl mb-6">
                {t("price_basic_price")}
              </p>
              <ul className="space-y-3 mb-6 flex-1">
                {sharedFeatures.map((key) => (
                  <li key={key} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#0170B9] flex-shrink-0 mt-0.5" />
                    <span className="font-primary text-sm text-dark">{t(key)}</span>
                  </li>
                ))}
                {trackerFeatures.map((key) => (
                  <li key={key} className="flex items-start gap-2.5 opacity-40">
                    <X className="w-4 h-4 text-[#808285] flex-shrink-0 mt-0.5" />
                    <span className="font-primary text-sm text-text-secondary">{t(key)}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#solicitar-acceso"
                className="w-full flex items-center justify-center py-4 px-6 rounded-xl border-2 border-[#314C8B] text-[#314C8B] font-primary font-bold text-base hover:bg-[#314C8B] hover:text-white transition-colors"
              >
                {t("price_cta_basic")}
              </a>
            </div>
          </FadeIn>

          {/* Complete — highlighted */}
          <FadeIn delay={120}>
            <div
              className="rounded-2xl p-7 border-2 h-full flex flex-col relative overflow-hidden shadow-xl"
              style={{ borderColor: "#0170B9", background: "white" }}
            >
              {/* Badge */}
              <div
                className="absolute top-0 right-0 font-primary text-xs font-bold text-white px-4 py-1.5 rounded-bl-xl"
                style={{ background: "#0170B9" }}
              >
                {t("price_badge")}
              </div>
              <p className="font-primary text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#0170B9" }}>
                {t("price_complete_title")}
              </p>
              <p className="font-display font-bold text-3xl mb-6" style={{ color: "#0170B9" }}>
                {t("price_complete_price")}
              </p>
              <ul className="space-y-3 mb-6 flex-1">
                {sharedFeatures.map((key) => (
                  <li key={key} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#0170B9" }} />
                    <span className="font-primary text-sm text-dark">{t(key)}</span>
                  </li>
                ))}
                {trackerFeatures.map((key) => (
                  <li key={key} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#0170B9" }} />
                    <span className="font-primary text-sm font-semibold text-dark">{t(key)}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#solicitar-acceso"
                className="w-full flex items-center justify-center py-4 px-6 rounded-xl text-white font-primary font-bold text-base transition-colors shadow-lg"
                style={{ background: "#0170B9" }}
              >
                {t("price_cta_complete")}
              </a>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={200}>
          <p className="font-primary text-xs text-text-secondary text-center">
            {t("price_anchor")}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ── S12. FORM ────────────────────────────────────────────────────────────── */
function FormSection() {
  const t = useTranslations("landing");
  return (
    <>
      <section
        id="solicitar-acceso"
        className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F5F7FA]"
      >
        <div className="max-w-xl mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="font-display font-bold text-[#0a1628] leading-tight mb-3 text-2xl sm:text-3xl lg:text-4xl">
                {t("access_title")}
              </h2>
              <p className="font-primary text-sm text-text-secondary leading-relaxed">
                {t("access_subtitle")}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-soft p-7 sm:p-10">
              <AccessRequestForm />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-[#F5F7FA] border-t border-[#EBEEF3]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-card">
            <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary font-body leading-relaxed text-left">
              <span className="font-semibold text-dark">Aviso médico: </span>
              {t("disclaimer")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
