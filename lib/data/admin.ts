import { createAdminClient } from "@/lib/supabase";
import { createServerClient } from "@/lib/supabase-server";
import { PatientStatus } from "@/lib/types";

export interface AdminPatientRow {
  id: string;
  full_name: string;
  email: string;
  access_active: boolean;
  created_at: string;
  current_week: number;
  current_pain: number;
  adherence_percentage: number;
  recovery_score: number;
  streak: number;
  status: PatientStatus;
  last_log_date: string | null;
}

export interface AccessRequest {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  how_found: string | null;
  status: string;
  created_at: string;
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

export async function verifyAdminSession(): Promise<string | null> {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();
  if (profile?.role !== "admin") return null;
  return session.user.id;
}

export async function fetchAllPatients(): Promise<AdminPatientRow[]> {
  const adminClient = createAdminClient();

  const { data: profiles } = await adminClient
    .from("profiles")
    .select("*")
    .eq("role", "patient")
    .order("created_at", { ascending: false });

  if (!profiles || profiles.length === 0) return [];

  const userIds = profiles.map((p) => p.id);

  const [patientProfilesRes, logsRes, weeklyRes] = await Promise.all([
    adminClient.from("patient_profiles").select("*").in("user_id", userIds),
    adminClient.from("daily_logs").select("user_id,date,pain_score,exercises_completed").in("user_id", userIds),
    adminClient.from("weekly_progress").select("*").in("user_id", userIds),
  ]);

  const patientProfiles = patientProfilesRes.data || [];
  const logs = logsRes.data || [];
  const weeklyProgress = weeklyRes.data || [];

  return profiles.map((profile) => {
    const pp = patientProfiles.find((p) => p.user_id === profile.id);
    const userLogs = logs.filter((l) => l.user_id === profile.id);
    const userWeekly = weeklyProgress.filter((w) => w.user_id === profile.id);

    const startDate = pp?.program_start_date || profile.created_at.split("T")[0];
    const currentWeek = computeCurrentWeek(startDate);

    const sortedLogs = [...userLogs].sort((a, b) => a.date.localeCompare(b.date));
    const lastLog = sortedLogs[sortedLogs.length - 1];
    const currentPain = lastLog?.pain_score ?? 0;
    const lastLogDate = lastLog?.date || null;

    const start = new Date(startDate);
    const today = new Date();
    const daysElapsed = Math.min(42, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const completed = userLogs.filter((l) => l.exercises_completed).length;
    const adherence = daysElapsed > 0 ? Math.round((completed / daysElapsed) * 100) : 0;

    const latestWeekly = userWeekly.sort((a, b) => b.week_number - a.week_number)[0];
    const recoveryScore = latestWeekly?.recovery_score
      ?? Math.min(100, Math.round(adherence * 0.6 + Math.max(0, (10 - currentPain)) * 4));

    // Compute streak
    let streak = 0;
    for (let i = 0; i < 42; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const log = userLogs.find((l) => l.date === dateStr);
      if (log && log.exercises_completed) streak++;
      else break;
    }

    return {
      id: profile.id,
      full_name: profile.full_name || profile.email || "Paciente",
      email: profile.email || "",
      access_active: profile.access_active,
      created_at: profile.created_at,
      current_week: currentWeek,
      current_pain: currentPain,
      adherence_percentage: adherence,
      recovery_score: recoveryScore,
      streak,
      status: computeStatus(currentPain, adherence),
      last_log_date: lastLogDate,
    };
  });
}

export async function fetchAccessRequests(): Promise<AccessRequest[]> {
  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("access_requests")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}
