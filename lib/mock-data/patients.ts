import { Patient, AdminAlert } from "@/lib/types";

const today = new Date();
const formatDate = (daysAgo: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

// Generate daily logs for a patient
function generateLogs(userId: string, weeksActive: number, painStart: number, painTrend: "down" | "flat" | "up", adherence: number) {
  const logs = [];
  const totalDays = weeksActive * 7;
  for (let i = totalDays - 1; i >= 0; i--) {
    if (Math.random() > adherence / 100) continue;
    const weekNum = Math.floor((totalDays - i - 1) / 7) + 1;
    const progressRatio = (totalDays - i) / totalDays;
    let pain = painStart;
    if (painTrend === "down") pain = Math.max(0, painStart - progressRatio * (painStart * 0.6) + (Math.random() * 1.5 - 0.75));
    else if (painTrend === "flat") pain = painStart + (Math.random() * 2 - 1);
    else pain = Math.min(10, painStart + progressRatio * 2 + (Math.random() * 1.5 - 0.75));
    pain = Math.round(Math.max(0, Math.min(10, pain)));

    logs.push({
      id: `log-${userId}-${i}`,
      user_id: userId,
      date: formatDate(i),
      week_number: weekNum,
      pain_score: pain,
      exercises_completed: Math.random() > 0.2,
      mobility_status: (painTrend === "down" ? (Math.random() > 0.3 ? "better" : "same") : Math.random() > 0.5 ? "same" : "worse") as "better" | "same" | "worse",
      night_pain: pain > 5,
      sleep_quality: (pain < 4 ? "good" : pain < 7 ? "regular" : "bad") as "good" | "regular" | "bad",
      main_limitation: pain > 6 ? "Dificultad para levantar el brazo" : "Leve tensión al rotación",
      comments: "",
    });
  }
  return logs;
}

function generateWeeklyProgress(userId: string, weeks: number) {
  return Array.from({ length: weeks }, (_, i) => ({
    id: `weekly-${userId}-${i + 1}`,
    user_id: userId,
    week_number: i + 1,
    adherence_percentage: Math.round(70 + Math.random() * 30),
    average_pain: Math.round((8 - i * 0.8 + Math.random()) * 10) / 10,
    recovery_score: Math.round(40 + i * 10 + Math.random() * 5),
  }));
}

export const mockPatients: Patient[] = [
  // 1. María González — Semana 4, buena adherencia, dolor bajando
  {
    profile: {
      id: "p1",
      full_name: "María González",
      email: "maria@example.com",
      role: "patient",
      access_active: true,
      created_at: formatDate(28),
    },
    patient_profile: {
      id: "pp1",
      user_id: "p1",
      age: 42,
      affected_shoulder: "right",
      initial_diagnosis: "Tendinitis del manguito rotador",
      initial_pain_score: 7,
      main_goal: "Volver a actividades deportivas sin dolor",
      surgery_history: false,
      trauma_history: true,
      program_start_date: formatDate(28),
    },
    daily_logs: generateLogs("p1", 4, 7, "down", 85),
    weekly_progress: generateWeeklyProgress("p1", 4),
    current_week: 4,
    status: "excellent",
    last_log_date: formatDate(0),
    current_pain: 3,
    adherence_percentage: 85,
    recovery_score: 78,
    streak: 6,
  },

  // 2. Roberto Martínez — Semana 2, dolor elevado, alerta activa
  {
    profile: {
      id: "p2",
      full_name: "Roberto Martínez",
      email: "roberto@example.com",
      role: "patient",
      access_active: true,
      created_at: formatDate(14),
    },
    patient_profile: {
      id: "pp2",
      user_id: "p2",
      age: 55,
      affected_shoulder: "left",
      initial_diagnosis: "Lesión SLAP grado II",
      initial_pain_score: 8,
      main_goal: "Reducir el dolor nocturno y recuperar rango de movimiento",
      surgery_history: true,
      trauma_history: false,
      program_start_date: formatDate(14),
    },
    daily_logs: generateLogs("p2", 2, 8, "flat", 70),
    weekly_progress: generateWeeklyProgress("p2", 2),
    current_week: 2,
    status: "alert",
    last_log_date: formatDate(1),
    current_pain: 8,
    adherence_percentage: 68,
    recovery_score: 32,
    streak: 2,
  },

  // 3. Ana Rodríguez — Semana 6, completando programa, excelente
  {
    profile: {
      id: "p3",
      full_name: "Ana Rodríguez",
      email: "ana@example.com",
      role: "patient",
      access_active: true,
      created_at: formatDate(42),
    },
    patient_profile: {
      id: "pp3",
      user_id: "p3",
      age: 38,
      affected_shoulder: "right",
      initial_diagnosis: "Bursitis subacromial",
      initial_pain_score: 6,
      main_goal: "Completar el programa sin recaídas",
      surgery_history: false,
      trauma_history: false,
      program_start_date: formatDate(42),
    },
    daily_logs: generateLogs("p3", 6, 6, "down", 92),
    weekly_progress: generateWeeklyProgress("p3", 6),
    current_week: 6,
    status: "excellent",
    last_log_date: formatDate(0),
    current_pain: 1,
    adherence_percentage: 92,
    recovery_score: 94,
    streak: 14,
  },

  // 4. Carlos Pérez — Semana 3, baja adherencia, inactivo 4 días
  {
    profile: {
      id: "p4",
      full_name: "Carlos Pérez",
      email: "carlos@example.com",
      role: "patient",
      access_active: true,
      created_at: formatDate(21),
    },
    patient_profile: {
      id: "pp4",
      user_id: "p4",
      age: 48,
      affected_shoulder: "both",
      initial_diagnosis: "Inestabilidad glenohumeral crónica",
      initial_pain_score: 6,
      main_goal: "Fortalecer la musculatura del manguito",
      surgery_history: false,
      trauma_history: true,
      program_start_date: formatDate(21),
    },
    daily_logs: generateLogs("p4", 3, 6, "flat", 45),
    weekly_progress: generateWeeklyProgress("p4", 3),
    current_week: 3,
    status: "critical",
    last_log_date: formatDate(4),
    current_pain: 6,
    adherence_percentage: 42,
    recovery_score: 28,
    streak: 0,
  },

  // 5. Lucía Herrera — Semana 1, recién iniciando
  {
    profile: {
      id: "p5",
      full_name: "Lucía Herrera",
      email: "lucia@example.com",
      role: "patient",
      access_active: true,
      created_at: formatDate(7),
    },
    patient_profile: {
      id: "pp5",
      user_id: "p5",
      age: 31,
      affected_shoulder: "left",
      initial_diagnosis: "Tendinitis bicipital",
      initial_pain_score: 5,
      main_goal: "Volver a hacer ejercicio sin molestias",
      surgery_history: false,
      trauma_history: false,
      program_start_date: formatDate(7),
    },
    daily_logs: generateLogs("p5", 1, 5, "down", 80),
    weekly_progress: generateWeeklyProgress("p5", 1),
    current_week: 1,
    status: "stable",
    last_log_date: formatDate(1),
    current_pain: 4,
    adherence_percentage: 80,
    recovery_score: 45,
    streak: 3,
  },
];

// The logged-in patient for the patient-facing views (María González)
export const currentPatient = mockPatients[0];

export const mockAlerts: AdminAlert[] = [
  {
    id: "a1",
    patient_id: "p4",
    patient_name: "Carlos Pérez",
    type: "inactivity",
    message: "Sin registro por 4 días",
    created_at: formatDate(0),
    severity: "critical",
  },
  {
    id: "a2",
    patient_id: "p2",
    patient_name: "Roberto Martínez",
    type: "pain",
    message: "Dolor persistente > 7 por 5 días consecutivos",
    created_at: formatDate(0),
    severity: "critical",
  },
  {
    id: "a3",
    patient_id: "p4",
    patient_name: "Carlos Pérez",
    type: "adherence",
    message: "Adherencia del 42% — por debajo del umbral mínimo",
    created_at: formatDate(1),
    severity: "warning",
  },
];
