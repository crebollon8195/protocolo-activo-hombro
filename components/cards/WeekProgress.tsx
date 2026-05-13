interface WeekProgressProps {
  currentWeek: number;
}

export function WeekProgress({ currentWeek }: WeekProgressProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-primary font-semibold text-dark">Progreso del programa</span>
        <span className="text-xs text-primary font-primary font-semibold">
          Semana {currentWeek} / 6
        </span>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 6 }, (_, i) => i + 1).map((week) => (
          <div key={week} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full h-2.5 rounded-full transition-all ${
                week < currentWeek
                  ? "bg-primary"
                  : week === currentWeek
                  ? "bg-light-blue"
                  : "bg-bg-subtle"
              }`}
            />
            <span className="text-xs font-primary text-text-secondary hidden sm:block">S{week}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
