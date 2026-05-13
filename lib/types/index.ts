export type Role = "patient" | "admin";
export type AffectedShoulder = "left" | "right" | "both";
export type MobilityStatus = "better" | "same" | "worse";
export type SleepQuality = "good" | "regular" | "bad";
export type RecoveryRecommendation = "good" | "partial" | "poor";
export type PatientStatus = "excellent" | "stable" | "alert" | "critical";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  access_active: boolean;
  created_at: string;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  age: number;
  affected_shoulder: AffectedShoulder;
  initial_diagnosis: string;
  initial_pain_score: number;
  main_goal: string;
  surgery_history: boolean;
  trauma_history: boolean;
  program_start_date: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  week_number: number;
  pain_score: number;
  exercises_completed: boolean;
  mobility_status: MobilityStatus;
  night_pain: boolean;
  sleep_quality: SleepQuality;
  main_limitation: string;
  comments: string;
}

export interface WeeklyProgress {
  id: string;
  user_id: string;
  week_number: number;
  adherence_percentage: number;
  average_pain: number;
  recovery_score: number;
}

export interface FinalReport {
  id: string;
  user_id: string;
  report_status: string;
  pain_reduction_percentage: number;
  recommendation: RecoveryRecommendation;
  generated_at: string;
}

export interface Patient {
  profile: Profile;
  patient_profile: PatientProfile;
  daily_logs: DailyLog[];
  weekly_progress: WeeklyProgress[];
  current_week: number;
  status: PatientStatus;
  last_log_date: string | null;
  current_pain: number;
  adherence_percentage: number;
  recovery_score: number;
  streak: number;
}

export interface AdminAlert {
  id: string;
  patient_id: string;
  patient_name: string;
  type: "inactivity" | "pain" | "adherence" | "incomplete";
  message: string;
  created_at: string;
  severity: "warning" | "critical";
}
