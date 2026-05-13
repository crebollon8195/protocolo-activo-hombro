"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/layout/Logo";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, ClipboardList, Calendar, BookOpen, Activity, BarChart2, FileText } from "lucide-react";

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [slide, setSlide] = useState(0);
  const totalSteps = 3;

  function next() {
    if (step < totalSteps) setStep(step + 1);
  }
  function back() {
    if (step > 1) setStep(step - 1);
  }
  function finish() {
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col">
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-bg-subtle">
        <Logo />
        <LanguageToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-text-secondary font-primary font-semibold">
                {t("step_of", { step, total: totalSteps })}
              </span>
              <span className="text-xs text-primary font-primary font-semibold">
                {Math.round((step / totalSteps) * 100)}%
              </span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-1.5" />
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-8">
            {step === 1 && <StepMedicalProfile t={t} />}
            {step === 2 && <StepStartDate t={t} />}
            {step === 3 && <StepTutorial t={t} slide={slide} setSlide={setSlide} />}

            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <Button variant="outline" onClick={back} className="font-primary font-semibold">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {t("back")}
                </Button>
              ) : (
                <div />
              )}

              {step < totalSteps ? (
                <Button
                  onClick={next}
                  className="bg-primary hover:bg-dark text-white font-primary font-semibold"
                >
                  {t("next")}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={finish}
                  className="bg-primary hover:bg-dark text-white font-primary font-semibold"
                >
                  {t("finish")}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepMedicalProfile({ t }: { t: any }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-primary font-semibold text-dark">{t("step1_title")}</h2>
          <p className="text-sm text-text-secondary font-body">{t("step1_subtitle")}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-primary font-semibold text-dark">Edad</Label>
            <Input type="number" placeholder="42" min="18" max="100" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-primary font-semibold text-dark">Hombro afectado</Label>
            <select className="w-full h-9 px-3 rounded-md border border-input bg-white text-sm font-body">
              <option value="right">Derecho</option>
              <option value="left">Izquierdo</option>
              <option value="both">Ambos</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-primary font-semibold text-dark">Diagnóstico inicial</Label>
          <Input placeholder="Ej: Tendinitis del manguito rotador" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-primary font-semibold text-dark">Nivel de dolor inicial (0–10)</Label>
          <Input type="number" placeholder="7" min="0" max="10" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-primary font-semibold text-dark">Objetivo principal</Label>
          <Input placeholder="Ej: Volver a actividades deportivas sin dolor" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-primary font-semibold text-dark">¿Cirugías previas?</Label>
            <select className="w-full h-9 px-3 rounded-md border border-input bg-white text-sm font-body">
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-primary font-semibold text-dark">¿Trauma previo?</Label>
            <select className="w-full h-9 px-3 rounded-md border border-input bg-white text-sm font-body">
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepStartDate({ t }: { t: any }) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-primary font-semibold text-dark">{t("step2_title")}</h2>
          <p className="text-sm text-text-secondary font-body">{t("step2_subtitle")}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-primary font-semibold text-dark">
            Fecha de inicio del programa
          </Label>
          <Input type="date" defaultValue={today} max={today} />
        </div>

        <div className="bg-bg-subtle rounded-xl p-4">
          <p className="text-sm font-primary font-semibold text-dark mb-1">
            Duración del programa
          </p>
          <p className="text-sm text-text-secondary font-body">
            6 semanas · 42 días de seguimiento · Registro diario
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-sm font-body text-dark leading-relaxed">
            <span className="font-semibold">Importante:</span> Una vez iniciado el programa,
            debes registrar tu progreso cada día para obtener resultados precisos.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepTutorial({ t, slide, setSlide }: { t: any; slide: number; setSlide: (n: number) => void }) {
  const slides = [
    {
      icon: Activity,
      titleKey: "slide1_title",
      descKey: "slide1_desc",
    },
    {
      icon: BarChart2,
      titleKey: "slide2_title",
      descKey: "slide2_desc",
    },
    {
      icon: FileText,
      titleKey: "slide3_title",
      descKey: "slide3_desc",
    },
  ];
  const current = slides[slide];
  const Icon = current.icon;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-primary font-semibold text-dark">{t("step3_title")}</h2>
          <p className="text-sm text-text-secondary font-body">{t("step3_subtitle")}</p>
        </div>
      </div>

      <div className="text-center py-6">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-base font-primary font-semibold text-dark mb-2">
          {t(current.titleKey)}
        </h3>
        <p className="text-sm text-text-secondary font-body max-w-xs mx-auto leading-relaxed">
          {t(current.descKey)}
        </p>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === slide ? "bg-primary" : "bg-bg-subtle"
            }`}
          />
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-6">
        {slide > 0 && (
          <Button variant="outline" onClick={() => setSlide(slide - 1)} size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
        {slide < slides.length - 1 && (
          <Button
            onClick={() => setSlide(slide + 1)}
            size="sm"
            className="bg-primary text-white hover:bg-dark"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
