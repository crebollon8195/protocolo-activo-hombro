import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { buildChartData } from "@/lib/utils/recovery";
import { KpiCards } from "@/components/cards/KpiCards";
import { WeekProgress } from "@/components/cards/WeekProgress";
import { StatusCard } from "@/components/cards/StatusCard";
import { WeekCalendar } from "@/components/cards/WeekCalendar";
import { NotificationBell } from "@/components/cards/NotificationBell";
import { PainChart } from "@/components/charts/PainChart";
import { AdherenceChart } from "@/components/charts/AdherenceChart";
import { fetchPatientData, hasLoggedToday } from "@/lib/data/patient";
import { MilestoneBanner } from "@/components/ui/MilestoneBanner";
import { createServerClient } from "@/lib/supabase-server";
import { Plus, CheckCircle } from "lucide-react";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  // Redirect admins who land here (e.g. after auth) to the admin panel
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role === "admin") redirect("/admin");

  const patient = await fetchPatientData();
  if (!patient) redirect("/auth/login");

  const loggedToday = await hasLoggedToday(patient.profile.id);
  const chartData = buildChartData(patient.daily_logs);

  // Compute first name — never show the email
  const rawName = patient.profile.full_name;
  const nameToken = rawName && !rawName.includes("@")
    ? rawName.split(" ")[0]
    : patient.profile.email.split("@")[0].split(".")[0];
  const firstName = nameToken.charAt(0).toUpperCase() + nameToken.slice(1);

  // Compute consecutive days missed (starting from yesterday backward)
  const logDates = new Set(patient.daily_logs.map((l) => l.date));
  let daysMissed = 0;
  for (let i = 1; i <= 42; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    if (logDates.has(ds)) break;
    daysMissed++;
  }

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col">
      <Header role="patient" />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-primary font-semibold text-dark">
              {t("welcome", { name: firstName })}
            </h1>
            <p className="text-sm text-text-secondary font-body mt-0.5">
              {t("week_progress", { current: patient.current_week, total: 6 })}
            </p>
          </div>
          <NotificationBell />
        </div>

        <WeekProgress currentWeek={patient.current_week} />

        <div className="mt-6">
          <MilestoneBanner
            completedDays={patient.daily_logs.filter((l) => l.exercises_completed).length}
            streak={patient.streak}
          />
        </div>

        <div className="my-6">
          {loggedToday ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-6 py-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="font-primary font-semibold text-green-700">{t("logged_today")}</span>
            </div>
          ) : (
            <Link
              href="/tracking"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-dark text-white font-primary font-semibold px-6 py-4 rounded-2xl transition-colors shadow-card text-base w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              {t("log_today")}
            </Link>
          )}
        </div>

        <KpiCards patient={patient} />

        <div className="mt-6">
          <StatusCard patient={patient} daysMissed={daysMissed} />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-base font-primary font-semibold text-dark mb-4">
              {t("pain_evolution")}
            </h2>
            <PainChart data={chartData} />
          </div>
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-base font-primary font-semibold text-dark mb-4">
              {t("adherence_chart")}
            </h2>
            <AdherenceChart weeklyProgress={patient.weekly_progress} />
          </div>
        </div>

        <div className="mt-6">
          <WeekCalendar logs={patient.daily_logs} />
        </div>

      </main>
    </div>
  );
}
