"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { currentPatient } from "@/lib/mock-data/patients";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, User } from "lucide-react";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const patient = currentPatient;

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSave() {
    setLoading(true);
    // Mock save — connect Supabase here
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  }

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
            <p className="text-sm text-text-secondary font-body">{patient.profile.email}</p>
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
                  <Input defaultValue={patient.profile.full_name} className="font-body" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-primary font-semibold text-dark">{t("email")}</Label>
                  <Input type="email" defaultValue={patient.profile.email} className="font-body" />
                </div>
              </div>
              <div className="space-y-1.5 max-w-xs">
                <Label className="text-sm font-primary font-semibold text-dark">{t("age")}</Label>
                <Input type="number" defaultValue={patient.patient_profile.age} className="font-body" />
              </div>
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
                  defaultValue={patient.patient_profile.affected_shoulder}
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
                  defaultValue={patient.patient_profile.initial_diagnosis}
                  className="font-body"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-primary font-semibold text-dark">{t("initial_pain")}</Label>
                  <Input
                    type="number"
                    defaultValue={patient.patient_profile.initial_pain_score}
                    min={0}
                    max={10}
                    className="font-body"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-primary font-semibold text-dark">{t("goal")}</Label>
                <Input defaultValue={patient.patient_profile.main_goal} className="font-body" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-primary font-semibold text-dark">{t("surgery")}</Label>
                  <select
                    defaultValue={patient.patient_profile.surgery_history ? "true" : "false"}
                    className="w-full h-9 px-3 rounded-md border border-input bg-white text-sm font-body"
                  >
                    <option value="false">No</option>
                    <option value="true">Sí</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-primary font-semibold text-dark">{t("trauma")}</Label>
                  <select
                    defaultValue={patient.patient_profile.trauma_history ? "true" : "false"}
                    className="w-full h-9 px-3 rounded-md border border-input bg-white text-sm font-body"
                  >
                    <option value="false">No</option>
                    <option value="true">Sí</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-primary hover:bg-dark text-white font-primary font-semibold px-6"
            >
              {loading ? "Guardando..." : t("save")}
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
