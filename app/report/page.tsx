import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { currentPatient } from "@/lib/mock-data/patients";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, XCircle, Download, QrCode, FileText } from "lucide-react";

export default function ReportPage() {
  const t = useTranslations("report");
  const patient = currentPatient;

  const initialPain = patient.patient_profile.initial_pain_score;
  const finalPain = patient.current_pain;
  const painReduction = Math.round(((initialPain - finalPain) / initialPain) * 100);

  const recommendation =
    painReduction >= 50 && patient.adherence_percentage >= 70
      ? "good"
      : painReduction >= 20
      ? "partial"
      : "poor";

  const startDate = new Date(patient.patient_profile.program_start_date);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 42);

  const completedDays = patient.daily_logs.filter((l) => l.exercises_completed).length;

  const recConfig = {
    good: {
      icon: CheckCircle,
      title: t("good_title"),
      desc: t("good_desc"),
      badge: "bg-green-100 text-green-700 border-green-200",
      iconColor: "text-green-600",
      border: "border-green-200",
      bg: "bg-green-50",
    },
    partial: {
      icon: AlertTriangle,
      title: t("partial_title"),
      desc: t("partial_desc"),
      badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
      iconColor: "text-yellow-600",
      border: "border-yellow-200",
      bg: "bg-yellow-50",
    },
    poor: {
      icon: XCircle,
      title: t("poor_title"),
      desc: t("poor_desc"),
      badge: "bg-red-100 text-red-700 border-red-200",
      iconColor: "text-red-600",
      border: "border-red-200",
      bg: "bg-red-50",
    },
  };

  const config = recConfig[recommendation];
  const RecIcon = config.icon;

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col">
      <Header role="patient" />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Header card */}
        <div className="bg-dark text-white rounded-2xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white font-bold text-sm font-primary">
                  CR
                </div>
                <span className="font-primary font-semibold text-white">{t("doctor")}</span>
              </div>
              <h1 className="text-xl font-primary font-semibold text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-sm text-white/60 font-body">{t("subtitle")}</p>
            </div>
            <FileText className="w-8 h-8 text-white/30" />
          </div>
        </div>

        {/* Report content */}
        <div className="bg-white rounded-2xl shadow-card p-8 space-y-6">

          {/* Patient info */}
          <div>
            <h2 className="text-sm font-primary font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Información del paciente
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <ReportRow label={t("patient_name")} value={patient.profile.full_name} />
              <ReportRow
                label={t("program_dates")}
                value={`${startDate.toLocaleDateString("es-CO")} – ${endDate.toLocaleDateString("es-CO")}`}
              />
              <ReportRow
                label="Diagnóstico"
                value={patient.patient_profile.initial_diagnosis}
              />
              <ReportRow
                label="Hombro afectado"
                value={
                  patient.patient_profile.affected_shoulder === "right"
                    ? "Derecho"
                    : patient.patient_profile.affected_shoulder === "left"
                    ? "Izquierdo"
                    : "Ambos"
                }
              />
            </div>
          </div>

          <Separator />

          {/* Pain data */}
          <div>
            <h2 className="text-sm font-primary font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Evolución del dolor
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-bg-subtle rounded-xl p-4 text-center">
                <div className="text-2xl font-primary font-bold text-dark">{initialPain}/10</div>
                <div className="text-xs text-text-secondary font-body mt-1">{t("initial_pain")}</div>
              </div>
              <div className="bg-bg-subtle rounded-xl p-4 text-center">
                <div className="text-2xl font-primary font-bold text-primary">{finalPain}/10</div>
                <div className="text-xs text-text-secondary font-body mt-1">{t("final_pain")}</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-primary font-bold text-green-600">
                  -{Math.max(0, painReduction)}%
                </div>
                <div className="text-xs text-text-secondary font-body mt-1">{t("pain_reduction")}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Adherence data */}
          <div>
            <h2 className="text-sm font-primary font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Adherencia y cumplimiento
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <ReportMetric
                label={t("adherence")}
                value={`${patient.adherence_percentage}%`}
                color="#0170B9"
              />
              <ReportMetric
                label={t("days_completed")}
                value={`${completedDays}/42`}
                color="#314C8B"
              />
              <ReportMetric
                label={t("recovery_score")}
                value={`${patient.recovery_score}/100`}
                color="#22c55e"
              />
            </div>
          </div>

          <Separator />

          {/* Recommendation */}
          <div>
            <h2 className="text-sm font-primary font-semibold text-text-secondary uppercase tracking-wider mb-3">
              {t("recommendation")}
            </h2>
            <div className={`${config.bg} border ${config.border} rounded-2xl p-5 flex gap-4`}>
              <RecIcon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`} />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-primary font-semibold text-dark text-sm">{config.title}</span>
                </div>
                <p className="text-sm text-text-secondary font-body leading-relaxed">
                  {config.desc}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Signature & QR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="w-40 h-0.5 bg-dark mb-2" />
              <p className="text-sm font-primary font-semibold text-dark">{t("doctor")}</p>
              <p className="text-xs text-text-secondary font-body">{t("specialty")}</p>
              <p className="text-xs text-primary font-body mt-0.5">drcarlosrebollon.com</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-bg-subtle rounded-xl flex items-center justify-center">
                <QrCode className="w-8 h-8 text-text-secondary" />
              </div>
              <p className="text-xs text-text-secondary font-body">drcarlosrebollon.com</p>
            </div>
          </div>

          <div className="text-xs text-text-secondary font-body text-center">
            {t("generated")} {new Date().toLocaleDateString("es-CO")} ·
            ID: {patient.profile.id.toUpperCase()}
          </div>
        </div>

        {/* Download button */}
        <div className="mt-4 flex justify-center">
          <Button className="bg-primary hover:bg-dark text-white font-primary font-semibold px-8 py-3 rounded-xl flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t("download_pdf")}
          </Button>
        </div>

      </main>
    </div>
  );
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-text-secondary font-primary font-semibold mb-0.5">{label}</div>
      <div className="text-sm font-body text-dark">{value}</div>
    </div>
  );
}

function ReportMetric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-bg-subtle rounded-xl p-4 text-center">
      <div className="text-2xl font-primary font-bold" style={{ color }}>{value}</div>
      <div className="text-xs text-text-secondary font-body mt-1">{label}</div>
    </div>
  );
}
