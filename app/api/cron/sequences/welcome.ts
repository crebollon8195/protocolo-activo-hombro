import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase";
import { emailTemplate, ctaButton, firstName } from "@/lib/email-templates";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tracker.drcarlosrebollon.com";
const FROM    = "Dr. Carlos Rebollón <noreply@drcarlosrebollon.com>";

function resend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return new Resend(key);
}

interface Result { sent: number; skipped: number; errors: number }

export async function runWelcomeSequence(): Promise<Result> {
  const db  = createAdminClient();
  const r   = resend();
  const now = new Date();

  // Profiles created within the last 25 hours, active patients only
  const since = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();

  const { data: profiles, error } = await db
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "patient")
    .eq("access_active", true)
    .gte("created_at", since);

  if (error) throw new Error(`[welcome] DB query failed: ${error.message}`);
  if (!profiles?.length) return { sent: 0, skipped: 0, errors: 0 };

  let sent = 0, skipped = 0, errors = 0;

  for (const profile of profiles) {
    if (!profile.email) { skipped++; continue; }

    try {
      // Idempotency check — never send welcome twice
      const { data: existing } = await (db as any)
        .from("email_logs")
        .select("id")
        .eq("user_id", profile.id)
        .eq("email_type", "welcome")
        .maybeSingle();

      if (existing) { skipped++; continue; }

      const name = firstName(profile.full_name);

      const body = `
        <p style="font-size:16px;color:#374151;margin:0 0 16px;">
          Hola ${name},
        </p>
        <p style="font-size:16px;color:#374151;margin:0 0 16px;">
          <strong>Bienvenido al Protocolo Activo de Hombro.</strong>
        </p>
        <p style="font-size:16px;color:#374151;margin:0 0 24px;line-height:1.6;">
          Tu programa de 42 días comienza hoy. El Dr. Rebollón estará monitoreando
          tu evolución semana a semana.
        </p>
        ${ctaButton("Registrar mi primer día", `${APP_URL}/tracking`)}
        <p style="font-size:15px;font-weight:bold;color:#0a1628;margin:28px 0 10px;">
          Qué esperar esta semana:
        </p>
        <ul style="color:#374151;font-size:15px;line-height:1.9;
                   padding-left:20px;margin:0 0 28px;">
          <li>Registra tu nivel de dolor cada día (menos de 2 minutos)</li>
          <li>Sé honesto con los números — eso permite el seguimiento clínico real</li>
          <li>Si tienes dolor mayor a 8, el sistema alerta al Dr. Rebollón automáticamente</li>
        </ul>
        <p style="font-size:13px;color:#9CA3AF;margin:0;line-height:1.6;">
          Dr. Carlos Rebollón · Cirujano Ortopeda y Traumatólogo ·
          <a href="https://drcarlosrebollon.com"
             style="color:#0170B9;text-decoration:none;">drcarlosrebollon.com</a>
        </p>
      `;

      await r.emails.send({
        from:    FROM,
        to:      profile.email,
        subject: `Tu protocolo de 42 días comienza hoy, ${name}`,
        html:    emailTemplate(body),
      });

      await (db as any).from("email_logs").insert({
        user_id:    profile.id,
        email_type: "welcome",
        sent_at:    now.toISOString(),
        metadata:   { email: profile.email, name },
      });

      sent++;
    } catch (err) {
      console.error(`[welcome] Failed for ${profile.email}:`, err);
      errors++;
    }
  }

  return { sent, skipped, errors };
}
