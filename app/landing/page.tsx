import { useTranslations } from "next-intl";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Footer } from "@/components/layout/Footer";
import { AccessRequestForm } from "@/components/forms/AccessRequestForm";
import { Shield, ChevronRight, ArrowDown } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <ReframeSection />
        <CompareSection />
        <HowItWorksSection />
        <TransformationSection />
        <AuthoritySection />
        <SocialProofSection />
        <FormSection />
      </main>
      <Footer />
    </div>
  );
}

/* ── HEADER — unchanged ──────────────────────────────────────────────────── */
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

/* ── 1. HERO ─────────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      className="text-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 55%, #0e2a4a 100%)" }}
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-white/15 bg-white/5 rounded-full px-4 py-1.5 mb-10">
          <div className="w-1.5 h-1.5 rounded-full bg-[#8ECAEE]" />
          <span className="text-xs font-primary font-semibold text-[#8ECAEE] tracking-wide uppercase">
            Programa exclusivo · Recuperación conservadora de hombro
          </span>
        </div>

        {/* H1 */}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
          Tu hombro tiene solución.
          <br />
          <span className="italic font-display text-[#8ECAEE]">
            Y no siempre requiere cirugía.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="font-primary text-lg text-white/65 max-w-2xl mx-auto mb-10 leading-relaxed">
          Un programa de recuperación conservadora de 6 semanas, diseñado por un
          cirujano ortopeda especialista, para que puedas recuperar tu hombro con
          seguimiento médico continuo, desde cualquier lugar.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-20">
          <a
            href="#solicitar-acceso"
            className="inline-flex items-center justify-center gap-2 bg-[#0170B9] hover:bg-[#0159a0] text-white font-primary font-bold px-8 py-4 rounded-xl transition-colors shadow-lg text-sm"
          >
            Iniciar mi recuperación guiada
            <ChevronRight className="w-4 h-4" />
          </a>
          <a
            href="#como-funciona"
            className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/14 text-white border border-white/15 font-primary font-semibold px-8 py-4 rounded-xl transition-colors text-sm"
          >
            Ver cómo funciona
            <ArrowDown className="w-4 h-4" />
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-10 border-t border-white/10">
          {[
            { num: "6",     label: "Semanas de programa" },
            { num: "42",   label: "Días de seguimiento" },
            { num: "100%", label: "Supervisión médica continua" },
          ].map(({ num, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-2xl sm:text-3xl font-bold text-white">{num}</div>
              <div className="font-primary text-xs text-white/45 mt-1.5 leading-snug">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 2. REFRAME — The Real Problem ──────────────────────────────────────── */
function ReframeSection() {
  return (
    <section className="bg-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0a1628] leading-tight mb-6">
            Por qué muchos pacientes con dolor de hombro
            <br className="hidden sm:block" />
            no logran recuperarse completamente.
          </h2>
          <p className="font-primary text-base text-text-secondary leading-relaxed max-w-2xl mx-auto">
            El diagnóstico llegó. Tal vez te dijeron que necesitas terapia, ejercicios, tiempo.
            Pero sin seguimiento estructurado, sin monitoreo continuo y sin un sistema que detecte
            tu progreso real, muchos pacientes no logran recuperarse completamente.
            El problema no es solo el hombro.
            <span className="text-dark font-semibold"> Es la falta de acompañamiento durante la recuperación.</span>
          </p>
        </div>

        {/* Pain point cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              icon: "⏳",
              text: "Semanas enteras sin saber si estás progresando correctamente",
            },
            {
              icon: "📉",
              text: "Abandono de los ejercicios por falta de guía y motivación",
            },
            {
              icon: "🔔",
              text: "Señales de alarma detectadas demasiado tarde",
            },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="bg-[#F5F7FA] rounded-2xl p-6 border border-[#EBEEF3]"
            >
              <div className="text-3xl mb-4">{icon}</div>
              <p className="font-primary text-sm font-semibold text-dark leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 3. OLD vs NEW ───────────────────────────────────────────────────────── */
function CompareSection() {
  const oldItems = [
    "Consultas espaciadas semanas",
    "Sin seguimiento entre visitas",
    "Sin saber si el dolor es normal",
    "Sin registro del progreso real",
    "Incertidumbre constante",
  ];
  const newItems = [
    "Registro diario en menos de 2 minutos",
    "Tu cirujano ortopeda monitorea tu evolución",
    "Alertas automáticas si hay señales de alarma",
    "Gráficas de progreso en tiempo real",
    "Informe clínico final personalizado",
  ];

  return (
    <section className="bg-[#F5F7FA] py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0a1628] leading-tight">
            Dos formas de recuperarse. Solo una funciona.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Old */}
          <div className="bg-white rounded-2xl p-8 border border-[#EBEEF3]">
            <p className="font-primary text-xs font-bold text-text-secondary uppercase tracking-widest mb-6">
              Recuperación tradicional
            </p>
            <ul className="space-y-4">
              {oldItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-sm text-[#808285] leading-none flex-shrink-0">✕</span>
                  <span className="font-primary text-sm text-text-secondary">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* New */}
          <div
            className="rounded-2xl p-8 border-2"
            style={{ background: "#EBF4FC", borderColor: "#0170B9" }}
          >
            <p
              className="font-primary text-xs font-bold uppercase tracking-widest mb-6"
              style={{ color: "#0170B9" }}
            >
              Protocolo Activo de Hombro
            </p>
            <ul className="space-y-4">
              {newItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 text-sm font-bold flex-shrink-0" style={{ color: "#0170B9" }}>✓</span>
                  <span className="font-primary text-sm font-semibold text-dark">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 4. HOW IT WORKS ─────────────────────────────────────────────────────── */
function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Accedes al programa",
      desc: "Completa tu perfil y comienza tu protocolo personalizado de 42 días de recuperación conservadora.",
    },
    {
      num: "02",
      title: "Registras tu día en 2 minutos",
      desc: "Cada día respondes preguntas simples sobre tu dolor, movilidad y bienestar. Sin complicaciones, desde tu celular.",
    },
    {
      num: "03",
      title: "Tu médico te acompaña",
      desc: "El Dr. Rebollón monitorea tu evolución en tiempo real. Si algo no está bien, él lo detecta antes que tú.",
    },
    {
      num: "04",
      title: "Completas tu recuperación con evidencia",
      desc: "Al finalizar las 6 semanas, descargas tu informe clínico completo — un documento real de tu progreso y recuperación.",
    },
  ];

  return (
    <section id="como-funciona" className="bg-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-primary text-xs font-bold text-[#0170B9] uppercase tracking-widest mb-3">
            El programa
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0a1628] leading-tight">
            Tu camino de recuperación
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map(({ num, title, desc }) => (
            <div key={num} className="flex flex-col">
              <div
                className="font-display text-5xl font-bold mb-4 leading-none"
                style={{ color: "#0170B9", opacity: 0.15 }}
              >
                {num}
              </div>
              <h3 className="font-primary font-bold text-dark text-sm mb-2 leading-snug">{title}</h3>
              <p className="font-primary text-xs text-text-secondary leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 5. TRANSFORMATION ───────────────────────────────────────────────────── */
function TransformationSection() {
  const outcomes = [
    {
      headline: "Moverte sin dolor en tu día a día",
      sub: "Desde abrochar tu cinturón hasta alcanzar un estante. Sin pensarlo dos veces.",
    },
    {
      headline: "Recuperar el rango completo de movimiento de tu hombro",
      sub: "Semana a semana verás el progreso real, documentado y medible.",
    },
    {
      headline: "Volver a las actividades que más te importan — sin pensar en cirugía",
      sub: "Deporte, trabajo, familia. Con el respaldo de evidencia clínica real.",
    },
  ];

  return (
    <section
      className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8"
      style={{ background: "#314C8B" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight">
            ¿Cómo te sentirás al completar el programa?
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {outcomes.map(({ headline, sub }) => (
            <div key={headline} className="bg-white/8 border border-white/12 rounded-2xl p-7">
              <div className="w-8 h-1 rounded-full mb-5" style={{ background: "#8ECAEE" }} />
              <h3 className="font-display italic text-white text-lg font-bold leading-snug mb-3">
                {headline}
              </h3>
              <p className="font-primary text-xs text-white/55 leading-relaxed">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 6. AUTHORITY ────────────────────────────────────────────────────────── */
function AuthoritySection() {
  const points = [
    "Especialista en patología de hombro, codo y rodilla",
    "Programa diseñado clínicamente para maximizar la adherencia y los resultados sin necesidad de intervención quirúrgica",
    "Monitoreo activo y personalizado durante las 6 semanas completas del programa",
  ];

  return (
    <section className="bg-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-12 items-center">
          {/* Left — identity */}
          <div>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-xl text-white mb-6"
              style={{ background: "#314C8B" }}
            >
              CR
            </div>
            <p className="font-primary text-xs font-bold text-[#0170B9] uppercase tracking-widest mb-2">
              Tu cirujano ortopeda
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0a1628] mb-1">
              Dr. Carlos Rebollón
            </h2>
            <p className="font-primary text-sm text-text-secondary mb-6">
              Cirujano Ortopeda y Traumatólogo · Panamá
            </p>
            <p className="font-primary text-sm font-semibold text-dark leading-relaxed mb-6 border-l-4 pl-4" style={{ borderColor: "#0170B9" }}>
              Primer cirujano ortopeda en Panamá en implementar un sistema digital
              inteligente de seguimiento para recuperación conservadora de hombro.
            </p>
            <a
              href="https://drcarlosrebollon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-primary text-sm font-semibold text-[#0170B9] hover:underline"
            >
              drcarlosrebollon.com
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
          {/* Right — authority points */}
          <div className="space-y-4">
            {points.map((point) => (
              <div
                key={point}
                className="flex items-start gap-4 bg-[#F5F7FA] rounded-xl p-5"
              >
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                  style={{ background: "#0170B9" }}
                >
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
                <p className="font-primary text-sm text-dark leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 7. SOCIAL PROOF / DIFFERENTIATORS ──────────────────────────────────── */
function SocialProofSection() {
  const cards = [
    {
      title: "No estás solo",
      desc: "Tu médico puede ver tu progreso en tiempo real y contactarte si detecta algo importante.",
    },
    {
      title: "Basado en evidencia clínica",
      desc: "Un protocolo estructurado de 42 días diseñado por un especialista ortopeda.",
    },
    {
      title: "Resultado documentado",
      desc: "Al finalizar recibes un informe clínico real de tu evolución — no solo una sensación.",
    },
  ];

  return (
    <section className="bg-[#F5F7FA] py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0a1628] leading-tight">
            Lo que hace diferente a este programa
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {cards.map(({ title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-7 border border-[#EBEEF3] shadow-card">
              <div className="w-8 h-1 rounded-full mb-5" style={{ background: "#0170B9" }} />
              <h3 className="font-display font-bold text-[#314C8B] text-lg mb-3">{title}</h3>
              <p className="font-primary text-sm text-text-secondary leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 8. FORM SECTION ─────────────────────────────────────────────────────── */
function FormSection() {
  return (
    <>
      <section
        id="solicitar-acceso"
        className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8"
        style={{ background: "linear-gradient(160deg, #0a1628 0%, #0d1f3c 100%)" }}
      >
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
              Solicita tu acceso al programa
            </h2>
            <p className="font-primary text-sm text-white/60 leading-relaxed">
              El Dr. Rebollón revisará tu solicitud personalmente
              y te contactará en menos de 24 horas.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-soft p-8 sm:p-10">
            <AccessRequestForm />
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-[#F5F7FA] border-t border-[#EBEEF3]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-card">
            <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary font-body leading-relaxed text-left">
              <span className="font-semibold text-dark">Aviso médico: </span>
              Esta plataforma es una herramienta de seguimiento clínico. No reemplaza la consulta
              médica presencial. Ante cualquier empeoramiento repentino del dolor, suspende los
              ejercicios y contacta a tu médico.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
