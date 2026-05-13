import { useTranslations } from "next-intl";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { mockPatients, mockAlerts } from "@/lib/mock-data/patients";
import { getStatusColor, getStatusDot, formatDaysAgo } from "@/lib/utils/recovery";
import { AlertTriangle, Users, Activity, Target, CheckSquare, TrendingUp, Eye, MessageSquare, FileText, Clock, XCircle } from "lucide-react";


export default function AdminPage() {
  const t = useTranslations("admin");

  const totalActive = mockPatients.filter((p) => p.profile.access_active).length;
  const highPain = mockPatients.filter((p) => p.current_pain > 7).length;
  const lowAdherence = mockPatients.filter((p) => p.adherence_percentage < 50).length;
  const completing = mockPatients.filter((p) => p.current_week === 6).length;
  const weeklyActivity = mockPatients.filter((p) => {
    if (!p.last_log_date) return false;
    const diff = Math.floor(
      (new Date().getTime() - new Date(p.last_log_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff <= 7;
  }).length;
  const avgRecovery = Math.round(
    mockPatients.reduce((sum, p) => sum + p.recovery_score, 0) / mockPatients.length
  );

  const kpis = [
    { icon: Users, label: t("total_patients"), value: totalActive, color: "#0170B9" },
    { icon: Activity, label: t("high_pain"), value: highPain, color: "#ef4444" },
    { icon: Target, label: t("low_adherence"), value: lowAdherence, color: "#f97316" },
    { icon: CheckSquare, label: t("completing"), value: completing, color: "#22c55e" },
    { icon: Clock, label: t("weekly_activity"), value: weeklyActivity, color: "#5072AC" },
    { icon: TrendingUp, label: t("avg_recovery"), value: `${avgRecovery}`, color: "#314C8B" },
  ];

  const statusLabels: Record<string, string> = {
    excellent: t("status_excellent"),
    stable: t("status_stable"),
    alert: t("status_alert"),
    critical: t("status_critical"),
  };

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col">
      <Header role="admin" />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-6">
          <h1 className="text-2xl font-primary font-semibold text-dark">{t("dashboard_title")}</h1>
          <p className="text-sm text-text-secondary font-body mt-0.5">
            Protocolo Activo de Hombro — Vista clínica
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {kpis.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl shadow-card p-4">
              <Icon className="w-4 h-4 mb-2" style={{ color }} />
              <div className="text-xs text-text-secondary font-primary font-semibold mb-1 leading-tight">
                {label}
              </div>
              <div className="text-2xl font-primary font-bold" style={{ color }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {mockAlerts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <h2 className="text-base font-primary font-semibold text-dark">
                {t("alerts_title")} ({mockAlerts.length})
              </h2>
            </div>
            <div className="space-y-3">
              {mockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${
                    alert.severity === "critical"
                      ? "bg-red-50 border-red-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  {alert.severity === "critical" ? (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-primary font-semibold text-dark">
                        {alert.patient_name}
                      </span>
                      <span className="text-xs text-text-secondary font-body">
                        {formatDaysAgo(alert.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary font-body mt-0.5">{alert.message}</p>
                  </div>
                  <Link
                    href={`/admin/patient/${alert.patient_id}`}
                    className="text-xs text-primary hover:text-dark font-primary font-semibold flex-shrink-0"
                  >
                    Ver
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patients table */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-bg-subtle">
            <h2 className="text-base font-primary font-semibold text-dark">
              {t("patients_table")} ({mockPatients.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-subtle">
                <tr>
                  {[
                    t("col_name"),
                    t("col_week"),
                    t("col_pain"),
                    t("col_adherence"),
                    t("col_score"),
                    t("col_status"),
                    t("col_last_log"),
                    t("col_actions"),
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-primary font-semibold text-text-secondary uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-subtle">
                {mockPatients.map((patient) => (
                  <tr key={patient.profile.id} className="hover:bg-bg-subtle/50 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-primary font-semibold text-dark">
                          {patient.profile.full_name}
                        </div>
                        <div className="text-xs text-text-secondary font-body">
                          {patient.profile.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-primary font-semibold text-dark">
                        {patient.current_week}/6
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="text-sm font-primary font-bold"
                        style={{
                          color:
                            patient.current_pain <= 3
                              ? "#22c55e"
                              : patient.current_pain <= 6
                              ? "#eab308"
                              : "#ef4444",
                        }}
                      >
                        {patient.current_pain}/10
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-body text-dark">
                        {patient.adherence_percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-body text-dark">
                        {patient.recovery_score}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-primary font-semibold px-2.5 py-1 rounded-full ${getStatusColor(patient.status)}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(patient.status)}`} />
                        {statusLabels[patient.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-text-secondary font-body">
                        {formatDaysAgo(patient.last_log_date)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/patient/${patient.profile.id}`}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title={t("view_progress")}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          className="p-1.5 rounded-lg hover:bg-bg-subtle text-text-secondary transition-colors"
                          title={t("send_message")}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <Link
                          href="/report"
                          className="p-1.5 rounded-lg hover:bg-bg-subtle text-text-secondary transition-colors"
                          title={t("view_report")}
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
