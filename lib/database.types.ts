export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          role: string;
          access_active: boolean;
          access_type: string;
          reminder_time: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          role?: string;
          access_active?: boolean;
          access_type?: string;
          reminder_time?: string | null;
        };
        Update: {
          full_name?: string | null;
          email?: string | null;
          role?: string;
          access_active?: boolean;
          access_type?: string;
          reminder_time?: string | null;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string;
          email: string;
          token: string;
          used: boolean;
          expires_at: string;
          access_type: string;
          access_duration_days: number;
          label: string | null;
          created_at: string;
        };
        Insert: {
          email: string;
          token: string;
          used?: boolean;
          expires_at: string;
          access_type?: string;
          access_duration_days?: number;
          label?: string | null;
        };
        Update: {
          used?: boolean;
          expires_at?: string;
          access_type?: string;
          access_duration_days?: number;
          label?: string | null;
        };
        Relationships: [];
      };
      access_requests: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          full_name: string;
          email: string;
          phone: string | null;
          how_found: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          first_name: string;
          last_name: string;
          full_name: string;
          email: string;
          phone?: string | null;
          how_found?: string | null;
          status?: string;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          how_found?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      patient_profiles: {
        Row: {
          id: string;
          user_id: string;
          age: number | null;
          affected_shoulder: string | null;
          initial_diagnosis: string | null;
          initial_pain_score: number | null;
          main_goal: string | null;
          surgery_history: boolean;
          trauma_history: boolean;
          program_start_date: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          age?: number | null;
          affected_shoulder?: string | null;
          initial_diagnosis?: string | null;
          initial_pain_score?: number | null;
          main_goal?: string | null;
          surgery_history?: boolean;
          trauma_history?: boolean;
          program_start_date?: string | null;
        };
        Update: {
          age?: number | null;
          affected_shoulder?: string | null;
          initial_diagnosis?: string | null;
          initial_pain_score?: number | null;
          main_goal?: string | null;
          surgery_history?: boolean;
          trauma_history?: boolean;
          program_start_date?: string | null;
        };
        Relationships: [];
      };
      daily_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          week_number: number | null;
          pain_score: number | null;
          exercises_completed: boolean;
          mobility_status: string | null;
          night_pain: boolean;
          sleep_quality: string | null;
          main_limitation: string | null;
          comments: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          week_number?: number | null;
          pain_score?: number | null;
          exercises_completed?: boolean;
          mobility_status?: string | null;
          night_pain?: boolean;
          sleep_quality?: string | null;
          main_limitation?: string | null;
          comments?: string | null;
        };
        Update: {
          week_number?: number | null;
          pain_score?: number | null;
          exercises_completed?: boolean;
          mobility_status?: string | null;
          night_pain?: boolean;
          sleep_quality?: string | null;
          main_limitation?: string | null;
          comments?: string | null;
        };
        Relationships: [];
      };
      weekly_progress: {
        Row: {
          id: string;
          user_id: string;
          week_number: number;
          adherence_percentage: number;
          average_pain: number;
          recovery_score: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          week_number: number;
          adherence_percentage: number;
          average_pain: number;
          recovery_score: number;
        };
        Update: {
          adherence_percentage?: number;
          average_pain?: number;
          recovery_score?: number;
        };
        Relationships: [];
      };
      final_reports: {
        Row: {
          id: string;
          user_id: string;
          report_status: string;
          pain_reduction_percentage: number;
          recommendation: string;
          generated_at: string;
        };
        Insert: {
          user_id: string;
          report_status?: string;
          pain_reduction_percentage?: number;
          recommendation?: string;
        };
        Update: {
          report_status?: string;
          pain_reduction_percentage?: number;
          recommendation?: string;
        };
        Relationships: [];
      };
      admin_notes: {
        Row: {
          id: string;
          patient_id: string;
          note: string;
          created_at: string;
        };
        Insert: {
          patient_id: string;
          note: string;
        };
        Update: {
          note?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
