import { useTranslations } from "next-intl";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Footer } from "@/components/layout/Footer";
import { AccessRequestForm } from "@/components/forms/AccessRequestForm";
import {
  Activity, BarChart2, Bell, FileText, Shield, Smartphone,
  CheckCircle, ChevronRight, HelpCircle
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <BenefitsSection />
        <HowItWorksSection />
        <FeaturesSection />
        <FAQSection />
        <AccessRequestSection />
        <DisclaimerSection />
      </main>
      <Footer />
    </div>
  );
}

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
            className="text-sm font-primary font-semibold text-text-secondary hover:text-primary transition-colors"
          >
            {t("login")}
          </Link>
          <a
            href="#solicitar-acceso"
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-dark text-white font-primary font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
          >
            Solicitar acceso al programa
          </a>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  const t = useTranslations("landing");
  return (
    <section className="bg-gradient-to-br from-dark via-primary to-accent text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
          <Activity className="w-4 h-4 text-light-blue" />
          <span className="text-sm font-primary text-light-blue font-semibold">
            Dr. Carlos Rebollón · Protocolo Activo de Hombro
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-primary font-semibold text-white leading-tight mb-6">
          {t("hero_title")}
        </h1>
        <p className="text-lg text-white/80 font-body max-w-2xl mx-auto mb-8 leading-relaxed">
          {t("hero_subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#solicitar-acceso"
            className="inline-flex items-center gap-2 bg-white text-primary font-primary font-semibold px-8 py-3.5 rounded-xl hover:bg-light-blue hover:text-dark transition-all shadow-soft"
          >
            Solicitar acceso al programa
            <ChevronRight className="w-4 h-4" />
          </a>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white/10 text-white font-primary font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all border border-white/20"
          >
            {t("hero_cta_secondary")}
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { num: "6", label: "Semanas" },
            { num: "42", label: "Días de seguimiento" },
            { num: "100%", label: "Clínico" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-primary font-bold text-white">{stat.num}</div>
              <div className="text-xs text-white/60 font-body mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const t = useTranslations("landing");
  const benefits = [
    { icon: Activity, titleKey: "benefit1_title", descKey: "benefit1_desc" },
    { icon: BarChart2, titleKey: "benefit2_title", descKey: "benefit2_desc" },
    { icon: Bell, titleKey: "benefit3_title", descKey: "benefit3_desc" },
    { icon: FileText, titleKey: "benefit4_title", descKey: "benefit4_desc" },
    { icon: Shield, titleKey: "benefit5_title", descKey: "benefit5_desc" },
    { icon: Smartphone, titleKey: "benefit6_title", descKey: "benefit6_desc" },
  ];
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-primary font-semibold text-dark text-center mb-10">
          {t("benefits_title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map(({ icon: Icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="bg-bg-subtle rounded-2xl p-6 shadow-card hover:shadow-soft transition-shadow"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-primary font-semibold text-dark mb-2">
                {t(titleKey as any)}
              </h3>
              <p className="text-sm text-text-secondary font-body leading-relaxed">
                {t(descKey as any)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const t = useTranslations("landing");
  const steps = [
    { num: "01", titleKey: "step1_title", descKey: "step1_desc" },
    { num: "02", titleKey: "step2_title", descKey: "step2_desc" },
    { num: "03", titleKey: "step3_title", descKey: "step3_desc" },
    { num: "04", titleKey: "step4_title", descKey: "step4_desc" },
  ];
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-bg-subtle">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-primary font-semibold text-dark text-center mb-10">
          {t("how_title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ num, titleKey, descKey }) => (
            <div key={num} className="bg-white rounded-2xl p-6 shadow-card text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-primary font-bold text-sm">{num}</span>
              </div>
              <h3 className="text-base font-primary font-semibold text-dark mb-2">
                {t(titleKey as any)}
              </h3>
              <p className="text-sm text-text-secondary font-body leading-relaxed">
                {t(descKey as any)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const t = useTranslations("landing");
  const features = ["feature1", "feature2", "feature3", "feature4", "feature5"];
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-dark">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-primary font-semibold text-white mb-10">
          {t("features_title")}
        </h2>
        <div className="flex flex-col gap-3 max-w-2xl mx-auto">
          {features.map((key) => (
            <div
              key={key}
              className="flex items-center gap-3 bg-white/10 rounded-xl px-5 py-4"
            >
              <CheckCircle className="w-5 h-5 text-light-blue flex-shrink-0" />
              <span className="text-white font-body text-sm text-left">
                {t(key as any)}
              </span>
            </div>
          ))}
        </div>
        <a
          href="#solicitar-acceso"
          className="inline-flex items-center gap-2 mt-8 bg-primary text-white font-primary font-semibold px-8 py-3.5 rounded-xl hover:bg-accent transition-all shadow-soft"
        >
          Comenzar ahora
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}

function FAQSection() {
  const t = useTranslations("landing");
  const faqs = [
    { q: "faq1_q", a: "faq1_a" },
    { q: "faq2_q", a: "faq2_a" },
    { q: "faq3_q", a: "faq3_a" },
    { q: "faq4_q", a: "faq4_a" },
    { q: "faq5_q", a: "faq5_a" },
  ];
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-primary font-semibold text-dark text-center mb-10">
          {t("faq_title")}
        </h2>
        <div className="flex flex-col gap-4">
          {faqs.map(({ q, a }) => (
            <div key={q} className="bg-bg-subtle rounded-2xl p-6 shadow-card">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-primary font-semibold text-dark mb-2">
                    {t(q as any)}
                  </h3>
                  <p className="text-sm text-text-secondary font-body leading-relaxed">
                    {t(a as any)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AccessRequestSection() {
  const t = useTranslations("landing");
  return (
    <section id="solicitar-acceso" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-dark via-primary to-accent">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-primary font-semibold text-white mb-3">
            {t("access_title")}
          </h2>
          <p className="text-sm text-white/80 font-body leading-relaxed">
            {t("access_subtitle")}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <AccessRequestForm />
        </div>
      </div>
    </section>
  );
}

function DisclaimerSection() {
  const t = useTranslations("landing");
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 bg-bg-subtle border-t border-bg-subtle">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-card">
          <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary font-body leading-relaxed text-left">
            <span className="font-semibold text-dark">Aviso médico: </span>
            {t("disclaimer")}
          </p>
        </div>
      </div>
    </section>
  );
}
