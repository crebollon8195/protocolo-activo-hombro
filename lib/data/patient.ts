import { createServerClient } from "@/lib/supabase-server";
import { Patient, PatientStatus } from "@/lib/types";

function computeCurrentWeek(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(6, Math.max(1, Math.ceil((daysDiff + 1) / 7)));
}

function computeStreak(logs: { date: string; exercises_completed: boolean }[]): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 42; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const log = logs.find((l) => l.date === dateStr);
    if (log && log.exercises_completed) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function computeAdherence(logs: { date: string; exercises_completed: boolean }[], startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const daysElapsed = Math.min(42, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const completed = logs.filter((l) => l.exercises_completed).length;
  return daysElapsed > 0 ? Math.round((completed / daysElapsed) * 100) : 0;
}

function computeStatus(pain: number, adherence: number): PatientStatus {
  if (pain <= 3 && adherence >= 70) return "excellent";
  if (pain <= 5 && adherence >= 50) return "stable";
  if (pain >= 7 || adherence < 30) return "critical";
  return "alert";
}

export async function fetchPatientData(): Promise<Patient | null> {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const userId = session.user.id;

  const [profileRes, patientProfileRes, logsRes, weeklyRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("patient_profiles").select("*").eq("user_id", userId).single(),
    supabase.from("daily_logs").select("*").eq("user_id", userId).order("date", { ascending: true }),
    supabase.from("weekly_progress").select("*").eq("user_id", userId).order("week_number", { ascending: true }),
  ]);

  if (!profileRes.data) return null;

  const profile = profileRes.data;
  const patientProfile = patientProfileRes.data;
  const logs = logsRes.data || [];
  const weeklyProgress = weeklyRes.data || [];

  const startDate = patientProfile?.program_start_date || profile.created_at.split("T")[0];
  const currentWeek = computeCurrentWeek(startDate);
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const lastLog = sortedLogs[sortedLogs.length - 1];
  const currentPain = lastLog?.pain_score ?? 0;
  const adherence = computeAdherence(logs, startDate);
  const streak = computeStreak(logs);
  const latestWeekly = weeklyProgress[weeklyProgress.length - 1];
  const recoveryScore = latestWeekly?.recovery_score
    ?? Math.min(100, Math.round(adherence * 0.6 + Math.max(0, (10 - currentPain)) * 4));
  const status = computeStatus(currentPain, adherence);
  const lastLogDate = lastLog?.date || null;

  return {
    profile: {
      id: profile.id,
      full_name: profile.full_name || session.user.email || "Paciente",
      email: profile.email || session.user.email || "",
      role: profile.role as "patient" | "admin",
      access_active: profile.access_active,
      created_at: profile.created_at,
    },
    patient_profile: patientProfile ? {
      id: patientProfile.id,
      user_id: patientProfile.user_id,
      age: patientProfile.age || 0,
      affected_shoulder: (patientProfile.affected_shoulder as "left" | "right" | "both") || "right",
      initial_diagnosis: patientProfile.initial_diagnosis || "",
      initial_pain_score: patientProfile.initial_pain_score || 0,
      main_goal: patientProfile.main_goal || "",
      surgery_history: patientProfile.surgery_history,
      trauma_history: patientProfile.trauma_history,
      program_start_date: startDate,
    } : {
      id: "",
      user_id: userId,
      age: 0,
      affected_shoulder: "right",
      initial_diagnosis: "",
      initial_pain_score: 0,
      main_goal: "",
      surgery_history: false,
      trauma_history: false,
      program_start_date: startDate,
    },
    daily_logs: logs.map((l) => ({
      id: l.id,
      user_id: l.user_id,
      date: l.date,
      week_number: l.week_number || 1,
      pain_score: l.pain_score || 0,
      exercises_completed: l.exercises_completed,
      mobility_status: (l.mobility_status as "better" | "same" | "worse") || "same",
      night_pain: l.night_pain,
      sleep_quality: (l.sleep_quality as "good" | "regular" | "bad") || "regular",
      main_limitation: l.main_limitation || "",
      comments: l.comments || "",
    })),
    weekly_progress: weeklyProgress.map((w) => ({
      id: w.id,
      user_id: w.user_id,
      week_number: w.week_number,
      adherence_percentage: w.adherence_percentage,
      average_pain: w.average_pain,
      recovery_score: w.recovery_score,
    })),
    current_week: currentWeek,
    status,
    last_log_date: lastLogDate,
    current_pain: currentPain,
    adherence_percentage: adherence,
    recovery_score: recoveryScore,
    streak,
  };
}

export async function hasLoggedToday(userId: string): Promise<boolean> {
  const supabase = createServerClient();
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("daily_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("date", today)
    .single();
  return !!data;
}
