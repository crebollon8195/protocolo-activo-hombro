"use client";
import { useTranslations } from "next-intl";
import { Patient } from "@/lib/types";
import { getPainColor } from "@/lib/utils/recovery";
import { Activity, Target, CheckSquare, Flame, TrendingUp } from "lucide-react";

interface KpiCardsProps {
  patient: Patient;
}

export function KpiCards({ patient }: KpiCardsProps) {
  const t = useTranslations("dashboard");

  const kpis = [
    {
      icon: Activity,
      label: t("pain_today"),
      value: patient.current_pain.toString(),
      suffix: "/10",
      color: getPainColor(patient.current_pain),
    },
    {
      icon: Target,
      label: t("adherence"),
      value: patient.adherence_percentage.toString(),
      suffix: "%",
      color: "#0170B9",
    },
    {
      icon: CheckSquare,
      label: t("days_completed"),
      value: patient.daily_logs.filter((l) => l.exercises_completed).length.toString(),
      suffix: "/42",
      color: "#314C8B",
    },
    {
      icon: Flame,
      label: t("current_streak"),
      value: patient.streak.toString(),
      suffix: " días",
      color: "#f97316",
    },
    {
      icon: TrendingUp,
      label: t("weekly_progress"),
      value: patient.recovery_score.toString(),
      suffix: "/100",
      color: "#22c55e",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map(({ icon: Icon, label, value, suffix, color }) => (
        <div key={label} className="bg-white rounded-2xl shadow-card p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" style={{ color }} />
            <span className="text-xs text-text-secondary font-primary font-semibold truncate">
              {label}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-primary font-bold" style={{ color }}>
              {value}
            </span>
            <span className="text-xs text-text-secondary font-body">{suffix}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
