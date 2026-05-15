import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { createAdminClient } from "@/lib/supabase";
import { verifyAdminSession } from "@/lib/data/admin";
import { buildChartData, formatDaysAgo, getStatusColor, getStatusDot } from "@/lib/utils/recovery";
import { PainChart } from "@/components/charts/PainChart";
import { AdherenceChart } from "@/components/charts/AdherenceChart";
import { RecoveryGauge } from "@/components/charts/RecoveryGauge";
import { DailyLog, WeeklyProgress, PatientStatus } from "@/lib/types";
import { SendMessageButton } from "@/components/admin/SendMessageButton";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: { id: string };
}

function computeCurrentWeek(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(6, Math.max(1, Math.ceil((daysDiff + 1) / 7)));
}

function computeStatus(pain: number, adherence: number): PatientStatus {
  if (pain <= 3 && adherence >= 70) return "excellent";
  if (pain <= 5 && adherence >= 50) return "stable";
  if (pain >= 7 || adherence < 30) return "critical";
  return "alert";
}

const statusLabels: Record<string, string> = {
  excellent: "Excelente",
  stable: "Estable",
  alert: "Alerta",
  critical: "Requiere seguimiento",
};

export default async function AdminPatientDetailPage({ params }: PageProps) {
  const adminId = await verifyAdminSession();
  if (!adminId) redirect("/auth/login");

  const adminClient = createAdminClient();

  const [profileRes, patientProfileRes, logsRes, weeklyRes] = await Promise.all([
    adminClient.from("profiles").select("*").eq("id", params.id).single(),
    adminClient.from("patient_profiles").select("*").eq("user_id", params.id).single(),
    adminClient.from("daily_logs").select("*").eq("user_id", params.id).order("date", { ascending: true }),
    adminClient.from("weekly_progress").select("*").eq("user_id", params.id).order("week_number", { ascending: true }),
  ]);

  if (!profileRes.data) notFound();

  const profile = profileRes.data;

  // Fetch phone from access_requests using the patient's email
  const { data: accessReq } = await adminClient
    .from("access_requests")
    .select("phone")
    .eq("email", profile.email ?? "")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const patientPhone = accessReq?.phone ?? null;
  const patientProfile = patientProfileRes.data;
  const dailyLogs: DailyLog[] = (logsRes.data || []) as DailyLog[];
  const weeklyProgress: WeeklyProgress[] = (weeklyRes.data || []) as WeeklyProgress[];

  const startDate = patientProfile?.program_start_date || profile.created_at?.split("T")[0] || new Date().toISOString().split("T")[0];
  const currentWeek = computeCurrentWeek(startDate);

  const lastLog = dailyLogs[dailyLogs.length - 1];
  const currentPain = lastLog?.pain_score ?? 0;
  const lastLogDate = lastLog?.date || null;

  const today = new Date();
  const start = new Date(startDate);
  const daysElapsed = Math.min(42, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const completed = dailyLogs.filter((l) => l.exercises_completed).length;
  const adherence = daysElapsed > 0 ? Math.round((completed / daysElapsed) * 100) : 0;

  const latestWeekly = [...weeklyProgress].sort((a, b) => b.week_number - a.week_number)[0];
  const recoveryScore = latestWeekly?.recovery_score
    ?? Math.min(100, Math.round(adherence * 0.6 + Math.max(0, (10 - currentPain)) * 4));

  const status = computeStatus(currentPain, adherence);
  const chartData = buildChartData(dailyLogs);
  const completedDays = dailyLogs.filter((l) => l.exercises_completed).length;

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
                {profile.full_name || profile.email}
              </h1>
              <p className="text-sm text-text-secondary font-body">
                {profile.email} · Semana {currentWeek}/6
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-primary font-semibold px-3 py-1.5 rounded-full ${getStatusColor(status)}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(status)}`} />
              {statusLabels[status]}
            </span>
            <SendMessageButton
              patientEmail={profile.email ?? ""}
              patientName={profile.full_name || profile.email || "Paciente"}
              patientPhone={patientPhone}
            />
          </div>
        </div>

        {/* Patient info cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Dolor actual", value: `${currentPain}/10`, color: currentPain > 6 ? "#ef4444" : currentPain > 3 ? "#eab308" : "#22c55e" },
            { label: "Adherencia", value: `${adherence}%`, color: "#0170B9" },
            { label: "Días completados", value: `${completedDays}/42`, color: "#314C8B" },
            { label: "Último registro", value: formatDaysAgo(lastLogDate), color: "#808285" },
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
            <RecoveryGauge score={recoveryScore} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h2 className="text-base font-primary font-semibold text-dark mb-4">Adherencia semanal</h2>
          <AdherenceChart weeklyProgress={weeklyProgress} height={200} />
        </div>

        {/* Daily logs table */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-bg-subtle">
            <h2 className="text-base font-primary font-semibold text-dark">
              Registros diarios ({dailyLogs.length})
            </h2>
          </div>
          {dailyLogs.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-text-secondary font-body">Aún no hay registros diarios.</p>
            </div>
          ) : (
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
                  {[...dailyLogs].reverse().slice(0, 14).map((log) => (
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
          )}
        </div>

        {/* Weekly summaries */}
        {weeklyProgress.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-base font-primary font-semibold text-dark mb-4">Resúmenes semanales</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {weeklyProgress.map((w) => (
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
        )}

      </main>
    </div>
  );
}
