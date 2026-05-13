"use client";
import { useState } from "react";
import { Trophy, Star, X } from "lucide-react";

interface MilestoneBannerProps {
  completedDays: number;
  streak: number;
}

function getMilestone(completed: number, streak: number): { title: string; desc: string; emoji: string } | null {
  if (completed === 42) return { title: "¡Protocolo completado!", desc: "Has completado los 42 días del programa. ¡Felicitaciones, eso es un logro extraordinario!", emoji: "🏆" };
  if (completed === 21) return { title: "¡21 días completados!", desc: "Estás a la mitad del programa. Cada día cuenta — sigue así.", emoji: "⭐" };
  if (streak === 7) return { title: "¡7 días consecutivos!", desc: "Una semana completa sin fallar. Tu disciplina está dando resultados.", emoji: "🔥" };
  return null;
}

export function MilestoneBanner({ completedDays, streak }: MilestoneBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const milestone = getMilestone(completedDays, streak);

  if (!milestone || dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary to-dark rounded-2xl p-5 mb-6 text-white shadow-soft overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="w-4 h-4 text-white/70" />
      </button>

      <div className="flex items-start gap-4 relative">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">{milestone.emoji}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            {milestone.emoji === "🏆" ? (
              <Trophy className="w-4 h-4 text-yellow-300" />
            ) : (
              <Star className="w-4 h-4 text-yellow-300" />
            )}
            <h3 className="text-base font-primary font-bold text-white">{milestone.title}</h3>
          </div>
          <p className="text-sm text-white/80 font-body leading-relaxed">{milestone.desc}</p>
        </div>
      </div>
    </div>
  );
}
