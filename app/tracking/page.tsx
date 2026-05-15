"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { getPainColor } from "@/lib/utils/recovery";
import { CheckCircle, Activity } from "lucide-react";

export default function TrackingPage() {
  const t = useTranslations("tracking");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) window.location.href = "/auth/login";
    });
  }, []);

  const [pain, setPain] = useState(5);
  const [exercises, setExercises] = useState<boolean | null>(null);
  const [mobility, setMobility] = useState<"better" | "same" | "worse" | null>(null);
  const [nightPain, setNightPain] = useState<boolean | null>(null);
  const [sleep, setSleep] = useState<"good" | "regular" | "bad" | null>(null);
  const [limitation, setLimitation] = useState("");
  const [comments, setComments] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function getPainDescription() {
    if (pain <= 2) return `${t("pain_0")} / ${t("pain_mild")}`;
    if (pain <= 5) return t("pain_moderate");
    if (pain <= 8) return t("pain_intense");
    return t("pain_severe");
  }

  async function handleSave() {
    if (exercises === null || mobility === null) return;
    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      // Get patient profile to calculate week number
      const { data: patientProfile } = await supabase
        .from("patient_profiles")
        .select("program_start_date")
        .eq("user_id", user.id)
        .single();

      const today = new Date().toISOString().split("T")[0];
      const startDate = patientProfile?.program_start_date
        ? new Date(patientProfile.program_start_date)
        : new Date();
      const daysDiff = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.min(6, Math.max(1, Math.ceil((daysDiff + 1) / 7)));

      // Upsert daily log (prevent duplicate for same day)
      const { error: logError } = await supabase.from("daily_logs").upsert(
        {
          user_id: user.id,
          date: today,
          week_number: weekNumber,
          pain_score: pain,
          exercises_completed: exercises,
          mobility_status: mobility,
          night_pain: nightPain ?? false,
          sleep_quality: sleep ?? "regular",
          main_limitation: limitation || null,
          comments: comments || null,
        },
        { onConflict: "user_id,date" }
      );

      if (logError) {
        console.error("daily_logs upsert error:", JSON.stringify(logError));
        throw logError;
      }

      // Recalculate and upsert weekly_progress for this week
      const { data: weekLogs } = await supabase
        .from("daily_logs")
        .select("exercises_completed, pain_score")
        .eq("user_id", user.id)
        .eq("week_number", weekNumber);

      if (weekLogs && weekLogs.length > 0) {
        const completed = weekLogs.filter((l) => l.exercises_completed).length;
        const adherence = Math.round((completed / 7) * 100);
        const avgPain = Math.round(
          (weekLogs.reduce((s, l) => s + (l.pain_score || 0), 0) / weekLogs.length) * 10
        ) / 10;
        const recoveryScore = Math.min(100, Math.round(adherence * 0.6 + Math.max(0, (10 - avgPain)) * 4));

        await supabase.from("weekly_progress").upsert(
          {
            user_id: user.id,
            week_number: weekNumber,
            adherence_percentage: adherence,
            average_pain: avgPain,
            recovery_score: recoveryScore,
          },
          { onConflict: "user_id,week_number" }
        );
      }

      setSaved(true);
    } catch (err: any) {
      console.error("Tracking save error:", err);
      const msg = err?.message || err?.details || "Error desconocido";
      setError(`Error guardando el registro: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-bg-subtle flex flex-col">
        <Header role="patient" />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-card p-10 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-primary font-semibold text-dark mb-2">
              {t("success_msg")}
            </h2>
            <p className="text-sm text-text-secondary font-body mb-6">
              Tu progreso de hoy ha sido guardado.
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-primary hover:bg-dark text-white font-primary font-semibold w-full"
            >
              Volver al dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col">
      <Header role="patient" />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-primary font-semibold text-dark">{t("title")}</h1>
          </div>
          <p className="text-sm text-text-secondary font-body">{t("subtitle")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 space-y-8">

          {/* 1. Pain level */}
          <div className="space-y-4">
            <Label className="text-sm font-primary font-semibold text-dark">
              {t("pain_label")}
            </Label>
            <div className="text-center mb-2">
              <span
                className="text-4xl font-primary font-bold"
                style={{ color: getPainColor(pain) }}
              >
                {pain}
              </span>
              <span className="text-sm text-text-secondary font-body ml-2">
                — {getPainDescription()}
              </span>
            </div>
            <Slider
              min={0}
              max={10}
              step={1}
              value={[pain]}
              onValueChange={(val) => setPain(Array.isArray(val) ? val[0] : val)}
              className="w-full"
            />
            <div className="flex justify-between text-xs font-body text-text-secondary">
              <span>0 — Sin dolor</span>
              <span>5 — Moderado</span>
              <span>10 — Severo</span>
            </div>
            <div className="h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500" />
          </div>

          {/* 2. Exercises */}
          <div className="space-y-3">
            <Label className="text-sm font-primary font-semibold text-dark">
              {t("exercises_label")}
            </Label>
            <div className="flex gap-3">
              {([true, false] as const).map((val) => (
                <button
                  key={String(val)}
                  onClick={() => setExercises(val)}
                  className={`flex-1 py-3 rounded-xl font-primary font-semibold text-sm transition-colors border-2 ${
                    exercises === val
                      ? "border-primary bg-primary text-white"
                      : "border-bg-subtle bg-bg-subtle text-text-secondary hover:border-primary/50"
                  }`}
                >
                  {val ? t("yes") : t("no")}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Mobility */}
          <div className="space-y-3">
            <Label className="text-sm font-primary font-semibold text-dark">
              {t("mobility_label")}
            </Label>
            <div className="flex gap-3">
              {(["better", "same", "worse"] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setMobility(val)}
                  className={`flex-1 py-3 rounded-xl font-primary font-semibold text-sm transition-colors border-2 ${
                    mobility === val
                      ? "border-primary bg-primary text-white"
                      : "border-bg-subtle bg-bg-subtle text-text-secondary hover:border-primary/50"
                  }`}
                >
                  {t(val)}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Night pain */}
          <div className="space-y-3">
            <Label className="text-sm font-primary font-semibold text-dark">
              {t("night_pain_label")}
            </Label>
            <div className="flex gap-3">
              {([true, false] as const).map((val) => (
                <button
                  key={String(val)}
                  onClick={() => setNightPain(val)}
                  className={`flex-1 py-3 rounded-xl font-primary font-semibold text-sm transition-colors border-2 ${
                    nightPain === val
                      ? "border-primary bg-primary text-white"
                      : "border-bg-subtle bg-bg-subtle text-text-secondary hover:border-primary/50"
                  }`}
                >
                  {val ? t("yes") : t("no")}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Sleep quality */}
          <div className="space-y-3">
            <Label className="text-sm font-primary font-semibold text-dark">
              {t("sleep_label")}
            </Label>
            <div className="flex gap-3">
              {(["good", "regular", "bad"] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setSleep(val)}
                  className={`flex-1 py-3 rounded-xl font-primary font-semibold text-sm transition-colors border-2 ${
                    sleep === val
                      ? "border-primary bg-primary text-white"
                      : "border-bg-subtle bg-bg-subtle text-text-secondary hover:border-primary/50"
                  }`}
                >
                  {t(val)}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Main limitation */}
          <div className="space-y-2">
            <Label className="text-sm font-primary font-semibold text-dark">
              {t("limitation_label")}
            </Label>
            <Input
              value={limitation}
              onChange={(e) => setLimitation(e.target.value)}
              placeholder="Ej: Dificultad para levantar el brazo por encima de la cabeza"
              className="font-body"
            />
          </div>

          {/* 7. Comments */}
          <div className="space-y-2">
            <Label className="text-sm font-primary font-semibold text-dark">
              {t("comments_label")}
            </Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Cualquier observación adicional sobre tu día..."
              className="font-body resize-none"
              rows={3}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-700 font-body">{error}</p>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={loading || exercises === null || mobility === null}
            className="w-full bg-primary hover:bg-dark text-white font-primary font-semibold py-3 rounded-xl text-base"
          >
            {loading ? "Guardando..." : t("save_btn")}
          </Button>
        </div>
      </main>
    </div>
  );
}
