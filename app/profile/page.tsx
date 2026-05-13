"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, User, Bell, Loader2 } from "lucide-react";

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  reminder_time: string;
  age: number;
  affected_shoulder: string;
  initial_diagnosis: string;
  initial_pain_score: number;
  main_goal: string;
  surgery_history: boolean;
  trauma_history: boolean;
}

export default function ProfilePage() {
  const t = useTranslations("profile");

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, ppRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("patient_profiles").select("*").eq("user_id", user.id).single(),
    ]);

    setData({
      id: user.id,
      full_name: profileRes.data?.full_name || "",
      email: profileRes.data?.email || user.email || "",
      reminder_time: profileRes.data?.reminder_time || "08:00",
      age: ppRes.data?.age || 0,
      affected_shoulder: ppRes.data?.affected_shoulder || "right",
      initial_diagnosis: ppRes.data?.initial_diagnosis || "",
      initial_pain_score: ppRes.data?.initial_pain_score || 0,
      main_goal: ppRes.data?.main_goal || "",
      surgery_history: ppRes.data?.surgery_history ?? false,
      trauma_history: ppRes.data?.trauma_history ?? false,
    });
    setLoading(false);
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setError("");

    const [profileRes, ppRes] = await Promise.all([
      supabase.from("profiles").update({
        full_name: data.full_name,
        reminder_time: data.reminder_time,
      }).eq("id", data.id),
      supabase.from("patient_profiles").upsert({
        user_id: data.id,
        age: data.age,
        affected_shoulder: data.affected_shoulder,
        initial_diagnosis: data.initial_diagnosis,
        initial_pain_score: data.initial_pain_score,
        main_goal: data.main_goal,
        surgery_history: data.surgery_history,
        trauma_history: data.trauma_history,
      }, { onConflict: "user_id" }),
    ]);

    if (profileRes.error || ppRes.error) {
      setError("Error guardando. Intenta de nuevo.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  function update(field: keyof ProfileData, value: string | number | boolean) {
    setData((prev) => prev ? { ...prev, [field]: value } : prev);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-subtle flex flex-col">
        <Header role="patient" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col">
      <Header role="patient" />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-primary font-semibold text-dark">{t("title")}</h1>
            <p className="text-sm text-text-secondary font-body">{data.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 space-y-6">

          {/* Personal info */}
          <div>
            <h2 className="text-sm font-primary font-semibold text-text-secondary uppercase tracking-wider mb-4">
              {t("personal_info")}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-primary font-semibold text-dark">{t("full_name")}</Label>
                  <Input
                    value={data.full_name}
                    onChange={(e) => update("full_name", e.target.value)}
                    className="font-body"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-primary font-semibold text-dark">{t("email")}</Label>
                  <Input type="email" value={data.email} disabled className="font-body bg-bg-subtle" />
                </div>
              </div>
              <div className="space-y-1.5 max-w-xs">
                <Label className="text-sm font-primary font-semibold text-dark">{t("age")}</Label>
                <Input
                  type="number"
                  value={data.age}
                  onChange={(e) => update("age", Number(e.target.value))}
                  className="font-body"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Reminder time */}
          <div>
            <h2 className="text-sm font-primary font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Recordatorio diario
            </h2>
            <div className="space-y-1.5 max-w-xs">
              <Label className="text-sm font-primary font-semibold text-dark">
                Hora de recordatorio
              </Label>
              <Input
                type="time"
                value={data.reminder_time}
                onChange={(e) => update("reminder_time", e.target.value)}
                className="font-body"
              />
              <p className="text-xs text-text-secondary font-body">
                Recibirás un recordatorio a esta hora para registrar tu progreso del día.
              </p>
            </div>
          </div>

          <Separator />

          {/* Medical info */}
          <div>
            <h2 className="text-sm font-primary font-semibold text-text-secondary uppercase tracking-wider mb-4">
              {t("medical_info")}
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-primary font-semibold text-dark">{t("shoulder")}</Label>
                <select
                  value={data.affected_shoulder}
                  onChange={(e) => update("affected_shoulder", e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-white text-sm font-body max-w-xs"
                >
                  <option value="right">{t("right")}</option>
                  <option value="left">{t("left")}</option>
                  <option value="both">{t("both")}</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-primary font-semibold text-dark">{t("diagnosis")}</Label>
                <Input
                  value={data.initial_diagnosis}
                  onChange={(e) => update("initial_diagnosis", e.target.value)}
                  className="font-body"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-primary font-semibold text-dark">{t("initial_pain")}</Label>
                  <Input
                    type="number"
                    value={data.initial_pain_score}
                    onChange={(e) => update("initial_pain_score", Number(e.target.value))}
                    min={0}
                    max={10}
                    className="font-body"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-primary font-semibold text-dark">{t("goal")}</Label>
                <Input
                  value={data.main_goal}
                  onChange={(e) => update("main_goal", e.target.value)}
                  className="font-body"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-primary font-semibold text-dark">{t("surgery")}</Label>
                  <select
                    value={data.surgery_history ? "true" : "false"}
                    onChange={(e) => update("surgery_history", e.target.value === "true")}
                    className="w-full h-9 px-3 rounded-md border border-input bg-white text-sm font-body"
                  >
                    <option value="false">No</option>
                    <option value="true">Sí</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-primary font-semibold text-dark">{t("trauma")}</Label>
                  <select
                    value={data.trauma_history ? "true" : "false"}
                    onChange={(e) => update("trauma_history", e.target.value === "true")}
                    className="w-full h-9 px-3 rounded-md border border-input bg-white text-sm font-body"
                  >
                    <option value="false">No</option>
                    <option value="true">Sí</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-700 font-body">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-dark text-white font-primary font-semibold px-6"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t("save")}
            </Button>
            {saved && (
              <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-primary font-semibold">{t("saved")}</span>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
