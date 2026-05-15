"use client";
import { useTranslations } from "next-intl";
import { DailyLog } from "@/lib/types";

interface WeekCalendarProps {
  logs: DailyLog[];
}

export function WeekCalendar({ logs }: WeekCalendarProps) {
  const t = useTranslations("dashboard");
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - 6 + i);
    return d;
  });

  const logMap = new Map(logs.map((l) => [l.date, l]));
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="text-base font-primary font-semibold text-dark mb-4">
        {t("weekly_calendar")}
      </h2>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dateStr = day.toISOString().split("T")[0];
          const log = logMap.get(dateStr);
          const isToday = dateStr === todayStr;
          const isFuture = dateStr > todayStr;
          // For today: fill if any log exists (user logged, regardless of exercises answer)
          // For past days: only fill if exercises were actually completed
          const completed = isToday ? !!log : log?.exercises_completed === true;

          return (
            <div
              key={dateStr}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors ${
                isToday ? "bg-primary/10 border border-primary/30" : ""
              }`}
            >
              <span className="text-xs text-text-secondary font-primary font-semibold">
                {dayNames[day.getDay()]}
              </span>
              <span
                className={`text-sm font-primary font-bold ${
                  isToday ? "text-primary" : "text-dark"
                }`}
              >
                {day.getDate()}
              </span>
              {completed ? (
                // Filled blue circle — completed
                <div className="w-5 h-5 rounded-full bg-primary" />
              ) : isFuture ? (
                // Future day — empty circle, greyed out
                <div className="w-5 h-5 rounded-full border-2 border-bg-subtle" />
              ) : (
                // Past or today without completion — empty circle with visible border
                <div className={`w-5 h-5 rounded-full border-2 ${isToday ? "border-primary/50" : "border-text-secondary/40"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
