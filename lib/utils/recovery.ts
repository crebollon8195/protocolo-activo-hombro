import { DailyLog } from "@/lib/types";

export function getPainColor(pain: number): string {
  if (pain <= 2) return "#22c55e"; // green
  if (pain <= 5) return "#eab308"; // yellow
  if (pain <= 8) return "#f97316"; // orange
  return "#ef4444"; // red
}

export function getPainLabel(pain: number, lang: "es" | "en" = "es"): string {
  if (lang === "en") {
    if (pain <= 2) return "No pain";
    if (pain <= 5) return "Moderate";
    if (pain <= 8) return "Intense";
    return "Severe";
  }
  if (pain <= 2) return "Sin dolor";
  if (pain <= 5) return "Moderado";
  if (pain <= 8) return "Intenso";
  return "Severo";
}

export function getRecoveryScoreColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#eab308";
  if (score >= 25) return "#f97316";
  return "#ef4444";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "excellent": return "bg-green-100 text-green-700";
    case "stable": return "bg-blue-100 text-blue-700";
    case "alert": return "bg-yellow-100 text-yellow-700";
    case "critical": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

export function getStatusDot(status: string): string {
  switch (status) {
    case "excellent": return "bg-green-500";
    case "stable": return "bg-blue-500";
    case "alert": return "bg-yellow-500";
    case "critical": return "bg-red-500";
    default: return "bg-gray-500";
  }
}

export function formatDaysAgo(dateStr: string | null): string {
  if (!dateStr) return "Nunca";
  const date = new Date(dateStr);
  const today = new Date();
  const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  return `Hace ${diff} días`;
}

export function buildChartData(logs: DailyLog[]) {
  return logs.slice(-14).map((log) => ({
    date: log.date.slice(5),
    pain: log.pain_score,
    completed: log.exercises_completed ? 1 : 0,
  }));
}
