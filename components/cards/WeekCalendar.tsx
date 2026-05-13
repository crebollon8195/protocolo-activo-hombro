"use client";
import { useTranslations } from "next-intl";
import { DailyLog } from "@/lib/types";
import { CheckCircle, Circle } from "lucide-react";

interface WeekCalendarProps {
  logs: DailyLog[];
}

export function WeekCalendar({ logs }: WeekCalendarProps) {
  const t = useTranslations("dashboard");
  const today = new Date();
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
          const isToday = dateStr === today.toISOString().split("T")[0];
          const isPast = day < today && !isToday;

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
              {log?.exercises_completed ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : isPast ? (
                <Circle className="w-5 h-5 text-text-secondary/30" />
              ) : (
                <Circle className="w-5 h-5 text-bg-subtle" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
