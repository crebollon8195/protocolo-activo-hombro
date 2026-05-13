import { useTranslations } from "next-intl";
import { Patient } from "@/lib/types";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface StatusCardProps {
  patient: Patient;
}

type StatusConfig = {
  icon: React.ElementType;
  bg: string;
  border: string;
  text: string;
  iconColor: string;
  label: string;
};

export function StatusCard({ patient }: StatusCardProps) {
  const t = useTranslations("dashboard");

  const configs: Record<string, StatusConfig> = {
    excellent: {
      icon: CheckCircle,
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      iconColor: "text-green-600",
      label: t("status_good"),
    },
    stable: {
      icon: CheckCircle,
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      iconColor: "text-blue-600",
      label: t("status_good"),
    },
    alert: {
      icon: AlertTriangle,
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      iconColor: "text-yellow-600",
      label: t("status_pain"),
    },
    critical: {
      icon: XCircle,
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      iconColor: "text-red-600",
      label: t("status_critical"),
    },
  };

  const config = configs[patient.status] || configs.stable;
  const Icon = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} rounded-2xl p-5 flex items-center gap-4`}>
      <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0`} />
      <div>
        <p className={`font-primary font-semibold text-sm ${config.text}`}>
          Estado actual: {config.label}
        </p>
        <p className="text-xs text-text-secondary mt-0.5 font-body">
          Recovery Score: {patient.recovery_score}/100 · Adherencia: {patient.adherence_percentage}%
        </p>
      </div>
    </div>
  );
}
