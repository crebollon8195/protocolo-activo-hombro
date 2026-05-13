import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { buildChartData } from "@/lib/utils/recovery";
import { PainChart } from "@/components/charts/PainChart";
import { AdherenceChart } from "@/components/charts/AdherenceChart";
import { RecoveryGauge } from "@/components/charts/RecoveryGauge";
import { fetchPatientData } from "@/lib/data/patient";
import { BarChart2, Target, CheckSquare, Flame, Trophy, AlertTriangle } from "lucide-react";

export default async function AnalyticsPage() {
  const t = await getTranslations("analytics");
  const patient = await fetchPatientData();

  if (!patient) redirect("/auth/login");

  const chartData = buildChartData(patient.daily_logs);

  const completedDays = patient.daily_logs.filter((l) => l.exercises_completed).length;
  const initialPain = patient.patient_profile.initial_pain_score || patient.current_pain;
  const painReduction = initialPain > 0
    ? Math.round(((initialPain - patient.current_pain) / initialPain) * 100)
    : 0;

  const weeklyByAdherence = [...patient.weekly_progress].sort(
    (a, b) => b.adherence_percentage - a.adherence_percentage
  );
  const bestWeek = weeklyByAdherence[0];
  const hardestWeek = weeklyByAdherence[weeklyByAdherence.length - 1];

  const stats = [
    { icon: CheckSquare, label: t("total_days"), value: `${completedDays}`, sub: t("of_42"), color: "#0170B9" },
    { icon: Target, label: t("pain_reduction"), value: `${Math.max(0, painReduction)}%`, sub: `${initialPain} → ${patient.current_pain}`, color: "#22c55e" },
    { icon: BarChart2, label: t("adherence_pct"), value: `${patient.adherence_percentage}%`, sub: "promedio", color: "#5072AC" },
    { icon: Flame, label: t("current_streak"), value: `${patient.streak}`, sub: "días consecutivos", color: "#f97316" },
    { icon: Trophy, label: t("best_week"), value: `Semana ${bestWeek?.week_number || "-"}`, sub: `${bestWeek?.adherence_percentage || "-"}% adherencia`, color: "#eab308" },
    { icon: AlertTriangle, label: t("hardest_week"), value: `Semana ${hardestWeek?.week_number || "-"}`, sub: `${hardestWeek?.adherence_percentage || "-"}% adherencia`, color: "#f97316" },
  ];

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col">
      <Header role="patient" />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-primary font-semibold text-dark">{t("title")}</h1>
          <p className="text-sm text-text-secondary font-body mt-0.5">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {stats.map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="bg-white rounded-2xl shadow-card p-4">
              <Icon className="w-4 h-4 mb-2" style={{ color }} />
              <div className="text-xs text-text-secondary font-primary font-semibold mb-1">{label}</div>
              <div className="text-xl font-primary font-bold" style={{ color }}>{value}</div>
              <div className="text-xs text-text-secondary font-body">{sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-card p-6 lg:col-span-1 flex flex-col items-center">
            <h2 className="text-base font-primary font-semibold text-dark mb-2 self-start">
              {t("recovery_score")}
            </h2>
            <RecoveryGauge score={patient.recovery_score} />
            <div className="mt-2 text-center">
              <p className="text-sm font-primary font-semibold text-dark">
                {patient.recovery_score >= 75
                  ? "Recuperación excelente"
                  : patient.recovery_score >= 50
                  ? "Recuperación parcial"
                  : "Requiere atención"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 lg:col-span-2">
            <h2 className="text-base font-primary font-semibold text-dark mb-4">
              {t("pain_trend")}
            </h2>
            <PainChart data={chartData} height={220} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h2 className="text-base font-primary font-semibold text-dark mb-4">
            {t("adherence_trend")}
          </h2>
          <AdherenceChart weeklyProgress={patient.weekly_progress} height={220} />
        </div>

        {patient.weekly_progress.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <h2 className="text-base font-primary font-semibold text-dark mb-4">
              {t("mobility_evolution")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {patient.weekly_progress.map((w) => {
                const weekLogs = patient.daily_logs.filter((l) => l.week_number === w.week_number);
                const betterCount = weekLogs.filter((l) => l.mobility_status === "better").length;
                const pct = weekLogs.length > 0 ? Math.round((betterCount / weekLogs.length) * 100) : 0;
                return (
                  <div key={w.week_number} className="bg-bg-subtle rounded-xl p-3 text-center">
                    <div className="text-xs text-text-secondary font-primary font-semibold mb-1">
                      Semana {w.week_number}
                    </div>
                    <div
                      className="text-lg font-primary font-bold"
                      style={{ color: pct >= 60 ? "#22c55e" : pct >= 40 ? "#eab308" : "#f97316" }}
                    >
                      {pct}%
                    </div>
                    <div className="text-xs text-text-secondary font-body">mejoría</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {patient.weekly_progress.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-base font-primary font-semibold text-dark mb-4">
              {t("recovery_timeline")}
            </h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-bg-subtle" />
              <div className="space-y-4">
                {patient.weekly_progress.map((w) => (
                  <div key={w.week_number} className="relative pl-10">
                    <div
                      className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 border-white ${
                        w.adherence_percentage >= 70 ? "bg-primary" : "bg-yellow-400"
                      }`}
                    />
                    <div className="bg-bg-subtle rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-primary font-semibold text-dark">
                          Semana {w.week_number}
                        </span>
                        <span className="text-xs text-primary font-primary font-semibold">
                          Score: {w.recovery_score}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-text-secondary font-body">
                        <span>Dolor promedio: {w.average_pain}</span>
                        <span>Adherencia: {w.adherence_percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {patient.daily_logs.length === 0 && (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center">
            <BarChart2 className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-40" />
            <p className="text-text-secondary font-body text-sm">
              Aún no hay datos. Registra tu primer día para ver tus analíticas.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}
