import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase";
import { emailTemplate, ctaButton, statRow, firstName } from "@/lib/email-templates";

const APP_URL   = process.env.NEXT_PUBLIC_APP_URL || "https://tracker.drcarlosrebollon.com";
const FROM      = "Dr. Carlos Rebollón <noreply@drcarlosrebollon.com>";
const ADMIN_EMAIL = "info@drcarlosrebollon.com";
const WHATSAPP  = "+50762285793";

function resend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return new Resend(key);
}

interface Result { sent: number; skipped: number; errors: number }

export async function runPainAlertSequence(): Promise<Result> {
  const db  = createAdminClient();
  const r   = resend();
  const now = new Date();

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // All active patients
  const { data: profiles, error } = await db
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "patient")
    .eq("access_active", true);

  if (error) throw new Error(`[pain-alert] DB query failed: ${error.message}`);
  if (!profiles?.length) return { sent: 0, skipped: 0, errors: 0 };

  let sent = 0, skipped = 0, errors = 0;

  for (const profile of profiles) {
    if (!profile.email) { skipped++; continue; }

    try {
      // Last 3 daily logs ordered by date DESC
      const { data: lastLogs } = await db
        .from("daily_logs")
        .select("date, pain_score")
        .eq("user_id", profile.id)
        .order("date", { ascending: false })
        .limit(3);

      if (!lastLogs || lastLogs.length < 3) { skipped++; continue; }

      const allHighPain = lastLogs.every(
        l => l.pain_score !== null && l.pain_score >= 8
      );
      if (!allHighPain) { skipped++; continue; }

      // Check: no high_pain_alert sent in the last 7 days
      const { data: recentAlert } = await (db as any)
        .from("email_logs")
        .select("id")
        .eq("user_id", profile.id)
        .eq("email_type", "high_pain_alert")
        .gte("sent_at", sevenDaysAgo)
        .maybeSingle();

      if (recentAlert) { skipped++; continue; }

      const name   = firstName(profile.full_name);
      const scores = lastLogs.map(l => l.pain_score as number);

      // ── Patient email ──────────────────────────────────────────────────────
      const patientBody = `
        <p style="font-size:16px;color:#374151;margin:0 0 16px;">Hola ${name},</p>
        <p style="font-size:16px;color:#374151;margin:0 0 16px;line-height:1.6;">
          Hemos detectado que has reportado <strong>dolor alto (≥ 8/10)
          durante 3 días consecutivos</strong>. Esto requiere atención.
        </p>
        <div style="background:#FEF2F2;border-left:4px solid #EF4444;
                    padding:16px 20px;margin:0 0 24px;border-radius:0 8px 8px 0;">
          <p style="margin:0;font-size:15px;color:#991B1B;font-weight:bold;">
            El Dr. Rebollón ya fue notificado.
          </p>
          <p style="margin:8px 0 0;font-size:14px;color:#7F1D1D;line-height:1.6;">
            Si el dolor es severo o tienes síntomas nuevos,
            comunícate por WhatsApp de inmediato:
          </p>
          <p style="margin:12px 0 0;">
            <a href="https://wa.me/${WHATSAPP.replace("+", "")}"
               style="background:#25D366;color:#ffffff;padding:10px 20px;
                      border-radius:6px;text-decoration:none;font-weight:bold;
                      font-size:14px;display:inline-block;">
              WhatsApp: ${WHATSAPP}
            </a>
          </p>
        </div>
        ${ctaButton("Ver mi historial de dolor", `${APP_URL}/dashboard`)}
        <p style="font-size:14px;color:#6B7280;margin:0 0 12px;line-height:1.6;">
          Continúa registrando tu dolor diariamente para que el seguimiento sea preciso.
        </p>
        <p style="font-size:13px;color:#9CA3AF;margin:0;line-height:1.6;">
          Dr. Carlos Rebollón · Cirujano Ortopeda y Traumatólogo ·
          <a href="https://drcarlosrebollon.com"
             style="color:#0170B9;text-decoration:none;">drcarlosrebollon.com</a>
        </p>
      `;

      await r.emails.send({
        from:    FROM,
        to:      profile.email,
        subject: `Alerta: dolor alto registrado 3 días consecutivos`,
        html:    emailTemplate(patientBody),
      });

      // ── Admin / doctor email ───────────────────────────────────────────────

      // Get extra context for admin: recovery score, week number
      const { data: weeklyProgress } = await db
        .from("weekly_progress")
        .select("recovery_score")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: patientProfile } = await db
        .from("patient_profiles")
        .select("program_start_date")
        .eq("id", profile.id)
        .maybeSingle();

      const startDate      = patientProfile?.program_start_date
        ? new Date(patientProfile.program_start_date)
        : null;
      const daysSinceStart = startDate
        ? Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const weekNumber     = daysSinceStart !== null
        ? Math.min(Math.ceil(daysSinceStart / 7), 6)
        : null;
      const recoveryScore  = weeklyProgress?.recovery_score ?? null;

      const adminBody = `
        <p style="font-size:16px;color:#374151;margin:0 0 16px;">
          <strong>Alerta clínica automática</strong>
        </p>
        <p style="font-size:16px;color:#374151;margin:0 0 24px;line-height:1.6;">
          El paciente <strong>${profile.full_name ?? name}</strong>
          (${profile.email}) ha registrado dolor ≥ 8/10 durante
          <strong>3 días consecutivos</strong>.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="border:1px solid #E5E7EB;border-radius:8px;
                      margin:0 0 28px;overflow:hidden;">
          <tbody>
            ${statRow("Dolor — día 1 (más reciente)", `${scores[0]}/10`)}
            ${statRow("Dolor — día 2", `${scores[1]}/10`)}
            ${statRow("Dolor — día 3", `${scores[2]}/10`)}
            ${recoveryScore !== null ? statRow("Puntaje de recuperación", `${recoveryScore}%`) : ""}
            ${weekNumber !== null ? statRow("Semana del protocolo", `Semana ${weekNumber}`) : ""}
          </tbody>
        </table>

        ${ctaButton("Ver perfil del paciente", `${APP_URL}/admin/patient/${profile.id}`)}

        <p style="font-size:13px;color:#9CA3AF;margin:0;line-height:1.6;">
          Este mensaje fue generado automáticamente por el sistema de monitoreo
          del Protocolo Activo de Hombro.
        </p>
      `;

      await r.emails.send({
        from:    FROM,
        to:      ADMIN_EMAIL,
        subject: `⚠️ Alerta dolor alto — ${profile.full_name ?? name} (${now.toLocaleDateString("es-PA")})`,
        html:    emailTemplate(adminBody),
      });

      // Log once (covers both sends)
      await (db as any).from("email_logs").insert({
        user_id:    profile.id,
        email_type: "high_pain_alert",
        sent_at:    now.toISOString(),
        metadata:   {
          email:          profile.email,
          name,
          pain_scores:    scores,
          recovery_score: recoveryScore,
          week_number:    weekNumber,
        },
      });

      sent++;
    } catch (err) {
      console.error(`[pain-alert] Failed for ${profile.email}:`, err);
      errors++;
    }
  }

  return { sent, skipped, errors };
}
