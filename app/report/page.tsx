import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { createAdminClient } from "@/lib/supabase";
import { createServerClient } from "@/lib/supabase-server";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, XCircle, FileText, QrCode } from "lucide-react";
import { PrintButton } from "@/components/ui/PrintButton";

interface PageProps {
  searchParams: { patient?: string };
}

export default async function ReportPage({ searchParams }: PageProps) {
  const t = await getTranslations("report");
  const adminClient = createAdminClient();
  const serverClient = createServerClient();

  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) redirect("/auth/login");

  // Determine whose report to show
  let targetUserId: string;
  let viewerRole: string = "patient";

  if (searchParams.patient) {
    // Admin viewing a patient's report
    const { data: callerProfile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (callerProfile?.role !== "admin") redirect("/dashboard");
    targetUserId = searchParams.patient;
    viewerRole = "admin";
  } else {
    // Patient viewing their own report
    targetUserId = user.id;
  }

  const [profileRes, patientProfileRes, logsRes, weeklyRes] = await Promise.all([
    adminClient.from("profiles").select("*").eq("id", targetUserId).single(),
    adminClient.from("patient_profiles").select("*").eq("user_id", targetUserId).single(),
    adminClient.from("daily_logs").select("*").eq("user_id", targetUserId).order("date", { ascending: true }),
    adminClient.from("weekly_progress").select("*").eq("user_id", targetUserId).order("week_number", { ascending: false }),
  ]);

  if (!profileRes.data) redirect("/dashboard");

  const profile = profileRes.data;
  const patientProfile = patientProfileRes.data;
  const logs = logsRes.data || [];
  const weeklyProgress = weeklyRes.data || [];

  const startDate = patientProfile?.program_start_date || profile.created_at?.split("T")[0] || new Date().toISOString().split("T")[0];
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 42);

  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const lastLog = sortedLogs[sortedLogs.length - 1];

  const initialPain = patientProfile?.initial_pain_score ?? (sortedLogs[0]?.pain_score ?? 0);
  const finalPain = lastLog?.pain_score ?? 0;
  const painReduction = initialPain > 0
    ? Math.round(((initialPain - finalPain) / initialPain) * 100)
    : 0;

  const today = new Date();
  const daysElapsed = Math.min(42, Math.floor((today.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const completedDays = logs.filter((l) => l.exercises_completed).length;
  const adherence = daysElapsed > 0 ? Math.round((completedDays / daysElapsed) * 100) : 0;
  const latestWeekly = weeklyProgress[0];
  const recoveryScore = latestWeekly?.recovery_score
    ?? Math.min(100, Math.round(adherence * 0.6 + Math.max(0, (10 - finalPain)) * 4));

  const recommendation =
    painReduction >= 50 && adherence >= 70 ? "good"
    : painReduction >= 20 ? "partial"
    : "poor";

  const recConfig = {
    good: {
      icon: CheckCircle,
      title: t("good_title"),
      desc: t("good_desc"),
      iconColor: "text-green-600",
      border: "border-green-200",
      bg: "bg-green-50",
    },
    partial: {
      icon: AlertTriangle,
      title: t("partial_title"),
      desc: t("partial_desc"),
      iconColor: "text-yellow-600",
      border: "border-yellow-200",
      bg: "bg-yellow-50",
    },
    poor: {
      icon: XCircle,
      title: t("poor_title"),
      desc: t("poor_desc"),
      iconColor: "text-red-600",
      border: "border-red-200",
      bg: "bg-red-50",
    },
  };

  const config = recConfig[recommendation];
  const RecIcon = config.icon;
  const patientName = profile.full_name || profile.email || "Paciente";
  const shortId = targetUserId.slice(0, 8).toUpperCase();

  const shoulderMap: Record<string, string> = { right: "Derecho", left: "Izquierdo", both: "Ambos" };

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col">
      <Header role={viewerRole as "patient" | "admin"} />
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
              <ReportRow label={t("patient_name")} value={patientName} />
              <ReportRow
                label={t("program_dates")}
                value={`${new Date(startDate).toLocaleDateString("es-CO")} – ${endDate.toLocaleDateString("es-CO")}`}
              />
              {patientProfile?.affected_shoulder && (
                <ReportRow
                  label="Hombro afectado"
                  value={shoulderMap[patientProfile.affected_shoulder] || patientProfile.affected_shoulder}
                />
              )}
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
                  {painReduction > 0 ? `-${painReduction}%` : `${Math.abs(painReduction)}%`}
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
              <ReportMetric label={t("adherence")} value={`${adherence}%`} color="#0170B9" />
              <ReportMetric label={t("days_completed")} value={`${completedDays}/42`} color="#314C8B" />
              <ReportMetric label={t("recovery_score")} value={`${recoveryScore}/100`} color="#22c55e" />
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
                <span className="font-primary font-semibold text-dark text-sm block mb-1">{config.title}</span>
                <p className="text-sm text-text-secondary font-body leading-relaxed">{config.desc}</p>
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
            {t("generated")} {new Date().toLocaleDateString("es-CO")} · ID: {shortId}
          </div>
        </div>

        {/* Print/download button */}
        <div className="mt-4 flex justify-center">
          <PrintButton label={t("download_pdf")} />
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
