import { useTranslations } from "next-intl";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { mockPatients } from "@/lib/mock-data/patients";
import { buildChartData, formatDaysAgo, getStatusColor, getStatusDot } from "@/lib/utils/recovery";
import { PainChart } from "@/components/charts/PainChart";
import { AdherenceChart } from "@/components/charts/AdherenceChart";
import { RecoveryGauge } from "@/components/charts/RecoveryGauge";
import { ArrowLeft, MessageSquare } from "lucide-react";

interface PageProps {
  params: { id: string };
}

export default function AdminPatientDetailPage({ params }: PageProps) {
  const t = useTranslations("admin");
  const patient = mockPatients.find((p) => p.profile.id === params.id);

  if (!patient) notFound();

  const chartData = buildChartData(patient.daily_logs);
  const completedDays = patient.daily_logs.filter((l) => l.exercises_completed).length;

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

        {/* Back + header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl hover:bg-white transition-colors text-text-secondary hover:text-dark"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-primary font-semibold text-dark">
                {patient.profile.full_name}
              </h1>
              <p className="text-sm text-text-secondary font-body">
                {patient.profile.email} · Semana {patient.current_week}/6
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-primary font-semibold px-3 py-1.5 rounded-full ${getStatusColor(patient.status)}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(patient.status)}`} />
              {statusLabels[patient.status]}
            </span>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-xs font-primary font-semibold rounded-xl hover:bg-dark transition-colors">
              <MessageSquare className="w-3 h-3" />
              Enviar mensaje
            </button>
          </div>
        </div>

        {/* Patient info cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Dolor actual", value: `${patient.current_pain}/10`, color: patient.current_pain > 6 ? "#ef4444" : patient.current_pain > 3 ? "#eab308" : "#22c55e" },
            { label: "Adherencia", value: `${patient.adherence_percentage}%`, color: "#0170B9" },
            { label: "Días completados", value: `${completedDays}/42`, color: "#314C8B" },
            { label: "Último registro", value: formatDaysAgo(patient.last_log_date), color: "#808285" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl shadow-card p-4">
              <div className="text-xs text-text-secondary font-primary font-semibold mb-1">{label}</div>
              <div className="text-xl font-primary font-bold" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-card p-6 lg:col-span-2">
            <h2 className="text-base font-primary font-semibold text-dark mb-4">Evolución del dolor</h2>
            <PainChart data={chartData} height={220} />
          </div>
          <div className="bg-white rounded-2xl shadow-card p-6 flex flex-col items-center">
            <h2 className="text-base font-primary font-semibold text-dark mb-2 self-start">Recovery Score</h2>
            <RecoveryGauge score={patient.recovery_score} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h2 className="text-base font-primary font-semibold text-dark mb-4">Adherencia semanal</h2>
          <AdherenceChart weeklyProgress={patient.weekly_progress} height={200} />
        </div>

        {/* Daily logs table */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-bg-subtle flex items-center justify-between">
            <h2 className="text-base font-primary font-semibold text-dark">
              Registros diarios ({patient.daily_logs.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-subtle">
                <tr>
                  {["Fecha", "Semana", "Dolor", "Ejercicios", "Movilidad", "Dolor nocturno", "Sueño"].map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-primary font-semibold text-text-secondary uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-subtle">
                {[...patient.daily_logs].reverse().slice(0, 14).map((log) => (
                  <tr key={log.id} className="hover:bg-bg-subtle/50">
                    <td className="px-4 py-3 text-sm font-body text-dark">{log.date}</td>
                    <td className="px-4 py-3 text-sm font-body text-dark">S{log.week_number}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-sm font-primary font-bold"
                        style={{
                          color: log.pain_score <= 3 ? "#22c55e" : log.pain_score <= 6 ? "#eab308" : "#ef4444",
                        }}
                      >
                        {log.pain_score}/10
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-primary font-semibold px-2 py-0.5 rounded-full ${log.exercises_completed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {log.exercises_completed ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-body text-dark capitalize">{log.mobility_status}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-primary font-semibold px-2 py-0.5 rounded-full ${log.night_pain ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {log.night_pain ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-body text-dark capitalize">{log.sleep_quality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weekly summaries */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-base font-primary font-semibold text-dark mb-4">Resúmenes semanales</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {patient.weekly_progress.map((w) => (
              <div key={w.week_number} className="bg-bg-subtle rounded-xl p-3">
                <div className="text-xs text-text-secondary font-primary font-semibold mb-2">
                  Semana {w.week_number}
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-body text-dark">
                    Dolor: <span className="font-semibold">{w.average_pain}</span>
                  </div>
                  <div className="text-xs font-body text-dark">
                    Adher: <span className="font-semibold">{w.adherence_percentage}%</span>
                  </div>
                  <div className="text-xs font-body text-dark">
                    Score: <span className="font-semibold text-primary">{w.recovery_score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

export function generateStaticParams() {
  return mockPatients.map((p) => ({ id: p.profile.id }));
}
