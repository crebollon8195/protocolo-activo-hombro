import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase";
import { emailTemplate, ctaButton, statRow, firstName } from "@/lib/email-templates";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tracker.drcarlosrebollon.com";
const FROM    = "Dr. Carlos Rebollón <noreply@drcarlosrebollon.com>";

function resend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return new Resend(key);
}

interface Result { sent: number; skipped: number; errors: number }

export async function runWeeklySummarySequence(): Promise<Result> {
  const db  = createAdminClient();
  const r   = resend();
  const now = new Date();

  // Only run on Mondays
  if (now.getDay() !== 1) return { sent: 0, skipped: 0, errors: 0 };

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const todayStr = now.toISOString().split("T")[0];

  // All active patients
  const { data: profiles, error } = await db
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "patient")
    .eq("access_active", true);

  if (error) throw new Error(`[weekly-summary] DB query failed: ${error.message}`);
  if (!profiles?.length) return { sent: 0, skipped: 0, errors: 0 };

  let sent = 0, skipped = 0, errors = 0;

  for (const profile of profiles) {
    if (!profile.email) { skipped++; continue; }

    try {
      // Logs from last 7 days
      const { data: recentLogs } = await db
        .from("daily_logs")
        .select("date, pain_score")
        .eq("user_id", profile.id)
        .gte("date", sevenDaysAgo)
        .lte("date", todayStr)
        .order("date", { ascending: false });

      if (!recentLogs?.length) { skipped++; continue; }

      // Logs from previous 7 days (for trend)
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const { data: prevLogs } = await db
        .from("daily_logs")
        .select("pain_score")
        .eq("user_id", profile.id)
        .gte("date", fourteenDaysAgo)
        .lte("date", eightDaysAgo);

      // Stat calculations
      const validScores = recentLogs
        .map(l => l.pain_score)
        .filter((s): s is number => s !== null && s !== undefined);

      if (!validScores.length) { skipped++; continue; }

      const avgPain    = validScores.reduce((a, b) => a + b, 0) / validScores.length;
      const daysLogged = recentLogs.length;
      const adherence  = Math.round((daysLogged / 7) * 100);

      const prevScores = (prevLogs ?? [])
        .map(l => l.pain_score)
        .filter((s): s is number => s !== null && s !== undefined);
      const prevAvg = prevScores.length
        ? prevScores.reduce((a, b) => a + b, 0) / prevScores.length
        : null;

      const trendDiff   = prevAvg !== null ? avgPain - prevAvg : null;
      const trendText   =
        trendDiff === null  ? "Sin datos previos" :
        trendDiff < -0.5    ? `↓ ${Math.abs(trendDiff).toFixed(1)} pts mejor que la semana pasada` :
        trendDiff > 0.5     ? `↑ ${trendDiff.toFixed(1)} pts más alto que la semana pasada` :
                              "≈ Similar a la semana pasada";

      // Patient profile for program start date
      const { data: patientProfile } = await db
        .from("patient_profiles")
        .select("program_start_date")
        .eq("id", profile.id)
        .maybeSingle();

      const startDate   = patientProfile?.program_start_date
        ? new Date(patientProfile.program_start_date)
        : null;
      const daysSinceStart = startDate
        ? Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const weekNumber  = daysSinceStart !== null
        ? Math.min(Math.ceil(daysSinceStart / 7), 6)
        : null;

      // Recovery score from weekly_progress
      const { data: weeklyProgress } = await db
        .from("weekly_progress")
        .select("recovery_score")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const recoveryScore = weeklyProgress?.recovery_score ?? null;

      const emailType = weekNumber
        ? `weekly_summary_week_${weekNumber}`
        : "weekly_summary";

      // Idempotency check
      const { data: existing } = await (db as any)
        .from("email_logs")
        .select("id")
        .eq("user_id", profile.id)
        .eq("email_type", emailType)
        .maybeSingle();

      if (existing) { skipped++; continue; }

      const name = firstName(profile.full_name);
      const weekLabel = weekNumber ? `Semana ${weekNumber}` : "Resumen semanal";

      // Milestone messages
      let milestoneBlock = "";
      if (weekNumber === 3) {
        milestoneBlock = `
          <div style="background:#F0F9FF;border-left:4px solid #0170B9;
                      padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;">
            <p style="margin:0;font-size:15px;color:#0a1628;font-weight:bold;">
              Punto de inflexión — Semana 3
            </p>
            <p style="margin:8px 0 0;font-size:14px;color:#374151;line-height:1.6;">
              La mayoría de los pacientes reportan su primera mejora sostenida
              alrededor de la semana 3. Tu seguimiento consistente es lo que
              hace posible este avance.
            </p>
          </div>`;
      } else if (weekNumber === 6) {
        milestoneBlock = `
          <div style="background:#F0FDF4;border-left:4px solid #16A34A;
                      padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;">
            <p style="margin:0;font-size:15px;color:#0a1628;font-weight:bold;">
              🎯 Completaste tu protocolo de 42 días
            </p>
            <p style="margin:8px 0 0;font-size:14px;color:#374151;line-height:1.6;">
              Este es un logro real. Tu informe final está listo para que lo revises
              junto con el Dr. Rebollón.
            </p>
          </div>`;
      }

      const reportLinks = weekNumber === 6
        ? `${ctaButton("Ver mi informe final", `${APP_URL}/report`)}
           <p style="text-align:center;font-size:14px;color:#6B7280;margin:-12px 0 24px;">
             ¿Quieres agendar tu revisión final?
             <a href="https://drcarlosrebollon.com"
                style="color:#0170B9;text-decoration:none;">drcarlosrebollon.com</a>
           </p>`
        : ctaButton("Ver mi progreso completo", `${APP_URL}/dashboard`);

      const body = `
        <p style="font-size:16px;color:#374151;margin:0 0 16px;">Hola ${name},</p>
        <p style="font-size:16px;color:#374151;margin:0 0 24px;line-height:1.6;">
          Aquí está tu resumen de <strong>${weekLabel}</strong>:
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="border:1px solid #E5E7EB;border-radius:8px;
                      margin:0 0 28px;overflow:hidden;">
          <tbody>
            ${statRow("Días registrados", `${daysLogged} / 7`)}
            ${statRow("Adherencia", `${adherence}%`)}
            ${statRow("Dolor promedio", avgPain.toFixed(1))}
            ${statRow("Tendencia", trendText)}
            ${recoveryScore !== null ? statRow("Puntaje de recuperación", `${recoveryScore}%`) : ""}
          </tbody>
        </table>

        ${milestoneBlock}
        ${reportLinks}

        <p style="font-size:13px;color:#9CA3AF;margin:0;line-height:1.6;">
          Dr. Carlos Rebollón · Cirujano Ortopeda y Traumatólogo ·
          <a href="https://drcarlosrebollon.com"
             style="color:#0170B9;text-decoration:none;">drcarlosrebollon.com</a>
        </p>
      `;

      await r.emails.send({
        from:    FROM,
        to:      profile.email,
        subject: `Tu resumen — ${weekLabel}, ${name}`,
        html:    emailTemplate(body),
      });

      await (db as any).from("email_logs").insert({
        user_id:    profile.id,
        email_type: emailType,
        sent_at:    now.toISOString(),
        metadata:   { email: profile.email, name, week_number: weekNumber, avg_pain: avgPain, adherence },
      });

      sent++;
    } catch (err) {
      console.error(`[weekly-summary] Failed for ${profile.email}:`, err);
      errors++;
    }
  }

  return { sent, skipped, errors };
}
