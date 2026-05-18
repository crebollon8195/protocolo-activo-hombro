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

export interface SequenceResult {
  sent: number;
  skipped: number;
  errors: number;
  details: string[];
}

export async function runWelcomeSequence(testEmail?: string): Promise<SequenceResult> {
  const db      = createAdminClient();
  const r       = resend();
  const now     = new Date();
  const isTest  = Boolean(testEmail);
  const details: string[] = [];

  let query = db
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "patient")
    .eq("access_active", true);

  if (!isTest) {
    // Production: only profiles created in the last 25 hours
    const since = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", since);
  } else {
    // Test mode: just grab the first active patient
    query = (query as any).limit(1);
  }

  const { data: profiles, error } = await query;

  if (error) throw new Error(`[welcome] DB query failed: ${error.message}`);

  if (!profiles?.length) {
    details.push(isTest
      ? "[welcome][TEST] No active patients found in the database."
      : "[welcome] No new patients in the last 25h.");
    return { sent: 0, skipped: 0, errors: 0, details };
  }

  let sent = 0, skipped = 0, errors = 0;

  for (const profile of profiles) {
    if (!profile.email) {
      details.push(`[welcome] Skipped ${profile.id}: no email address.`);
      skipped++;
      continue;
    }

    try {
      if (!isTest) {
        // Idempotency check — never send welcome twice in production
        const { data: existing } = await (db as any)
          .from("email_logs")
          .select("id")
          .eq("user_id", profile.id)
          .eq("email_type", "welcome")
          .maybeSingle();

        if (existing) {
          details.push(`[welcome] Skipped ${profile.email}: already sent.`);
          skipped++;
          continue;
        }
      }

      const name       = firstName(profile.full_name);
      const recipient  = isTest ? testEmail! : profile.email;
      const subjectRaw = `Tu protocolo de 42 días comienza hoy, ${name}`;
      const subject    = isTest ? `[TEST] ${subjectRaw}` : subjectRaw;

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
        to:      recipient,
        subject,
        html:    emailTemplate(body),
      });

      if (!isTest) {
        await (db as any).from("email_logs").insert({
          user_id:    profile.id,
          email_type: "welcome",
          sent_at:    now.toISOString(),
          metadata:   { email: profile.email, name },
        });
      }

      details.push(
        `[welcome]${isTest ? "[TEST]" : ""} Sent to ${recipient} using patient data: ${profile.full_name ?? "unknown"} (${profile.id})`
      );
      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      details.push(`[welcome] Error for ${profile.email}: ${msg}`);
      console.error(`[welcome] Failed for ${profile.email}:`, err);
      errors++;
    }
  }

  return { sent, skipped, errors, details };
}
