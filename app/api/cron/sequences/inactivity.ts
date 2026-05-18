import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase";
import { emailTemplate, ctaButton, firstName } from "@/lib/email-templates";
import type { SequenceResult } from "./welcome";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tracker.drcarlosrebollon.com";
const FROM    = "Dr. Carlos Rebollón <noreply@drcarlosrebollon.com>";

function resend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return new Resend(key);
}

type InactivityDay = 3 | 5 | 7;

function emailConfig(day: InactivityDay, name: string): { subject: string; body: string } {
  const cta = ctaButton("Registrar mi día de hoy", `${APP_URL}/tracking`);

  if (day === 3) {
    return {
      subject: `¿Todo bien, ${name}?`,
      body: `
        <p style="font-size:16px;color:#374151;margin:0 0 16px;">Hola ${name},</p>
        <p style="font-size:16px;color:#374151;margin:0 0 24px;line-height:1.6;">
          Han pasado <strong>3 días</strong> sin que registres tu evolución.
          El seguimiento diario es lo que permite al Dr. Rebollón ajustar tu protocolo
          en tiempo real — sin datos, no hay ajustes.
        </p>
        ${cta}
        <p style="font-size:15px;color:#374151;margin:0 0 12px;line-height:1.6;">
          Registrar toma menos de 2 minutos. Cada número cuenta.
        </p>
        <p style="font-size:13px;color:#9CA3AF;margin:0;line-height:1.6;">
          Dr. Carlos Rebollón · Cirujano Ortopeda y Traumatólogo ·
          <a href="https://drcarlosrebollon.com"
             style="color:#0170B9;text-decoration:none;">drcarlosrebollon.com</a>
        </p>
      `,
    };
  }

  if (day === 5) {
    return {
      subject: `${name}, tu recuperación te necesita`,
      body: `
        <p style="font-size:16px;color:#374151;margin:0 0 16px;">Hola ${name},</p>
        <p style="font-size:16px;color:#374151;margin:0 0 16px;line-height:1.6;">
          <strong>5 días sin registrar.</strong> En un protocolo de 42 días,
          cada semana es crítica.
        </p>
        <p style="font-size:16px;color:#374151;margin:0 0 24px;line-height:1.6;">
          El dolor no monitoreado no es dolor controlado. Si tu hombro está mejor,
          queremos saberlo — y si está peor, el Dr. Rebollón necesita saberlo ahora.
        </p>
        ${cta}
        <p style="font-size:14px;color:#6B7280;margin:0 0 12px;line-height:1.6;">
          Si estás teniendo dificultades con el protocolo, puedes escribirle directamente
          al Dr. Rebollón respondiendo este correo.
        </p>
        <p style="font-size:13px;color:#9CA3AF;margin:0;line-height:1.6;">
          Dr. Carlos Rebollón · Cirujano Ortopeda y Traumatólogo ·
          <a href="https://drcarlosrebollon.com"
             style="color:#0170B9;text-decoration:none;">drcarlosrebollon.com</a>
        </p>
      `,
    };
  }

  // day === 7
  return {
    subject: `Tu ventana de recuperación tiene un límite`,
    body: `
      <p style="font-size:16px;color:#374151;margin:0 0 16px;">Hola ${name},</p>
      <p style="font-size:16px;color:#374151;margin:0 0 16px;line-height:1.6;">
        <strong>Una semana sin registrar.</strong>
      </p>
      <p style="font-size:16px;color:#374151;margin:0 0 24px;line-height:1.6;">
        El Protocolo Activo de Hombro funciona solo cuando hay datos reales.
        Sin seguimiento, no es posible saber si tu hombro está mejorando,
        estancado, o empeorando — y el Dr. Rebollón no puede intervenir a tiempo.
      </p>
      <p style="font-size:16px;color:#374151;margin:0 0 24px;line-height:1.6;">
        Si deseas continuar tu protocolo, regresa hoy.
      </p>
      ${cta}
      <p style="font-size:14px;color:#6B7280;margin:0 0 12px;line-height:1.6;">
        Si tienes alguna duda o necesitas apoyo, escríbenos a
        <a href="mailto:info@drcarlosrebollon.com"
           style="color:#0170B9;text-decoration:none;">info@drcarlosrebollon.com</a>
      </p>
      <p style="font-size:13px;color:#9CA3AF;margin:0;line-height:1.6;">
        Dr. Carlos Rebollón · Cirujano Ortopeda y Traumatólogo ·
        <a href="https://drcarlosrebollon.com"
           style="color:#0170B9;text-decoration:none;">drcarlosrebollon.com</a>
      </p>
    `,
  };
}

export async function runInactivitySequence(testEmail?: string): Promise<SequenceResult> {
  const db      = createAdminClient();
  const r       = resend();
  const now     = new Date();
  const isTest  = Boolean(testEmail);
  const details: string[] = [];

  // All active patients (test mode: just the first one)
  let query = db
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "patient")
    .eq("access_active", true);

  if (isTest) query = (query as any).limit(1);

  const { data: profiles, error } = await query;

  if (error) throw new Error(`[inactivity] DB query failed: ${error.message}`);

  if (!profiles?.length) {
    details.push("[inactivity] No active patients found.");
    return { sent: 0, skipped: 0, errors: 0, details };
  }

  let sent = 0, skipped = 0, errors = 0;

  for (const profile of profiles) {
    if (!profile.email) {
      details.push(`[inactivity] Skipped ${profile.id}: no email address.`);
      skipped++;
      continue;
    }

    try {
      // Get the most recent daily_log date for this user
      const { data: lastLog } = await db
        .from("daily_logs")
        .select("date")
        .eq("user_id", profile.id)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!lastLog?.date) {
        details.push(`[inactivity] Skipped ${profile.email}: no daily logs found.`);
        skipped++;
        continue;
      }

      let triggerDay: InactivityDay;

      if (isTest) {
        // Test mode: always send the day-3 template regardless of actual inactivity
        triggerDay = 3;
        details.push(`[inactivity][TEST] Using day-3 template (last log: ${lastLog.date}).`);
      } else {
        const lastDate     = new Date(lastLog.date);
        const diffMs       = now.getTime() - lastDate.getTime();
        const daysInactive = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        const day =
          daysInactive === 3 ? 3 :
          daysInactive === 5 ? 5 :
          daysInactive === 7 ? 7 : null;

        if (!day) {
          details.push(`[inactivity] Skipped ${profile.email}: inactive ${daysInactive}d (not a trigger day).`);
          skipped++;
          continue;
        }
        triggerDay = day as InactivityDay;
      }

      const emailType = `inactivity_day${triggerDay}` as string;

      if (!isTest) {
        // Idempotency check
        const { data: existing } = await (db as any)
          .from("email_logs")
          .select("id")
          .eq("user_id", profile.id)
          .eq("email_type", emailType)
          .maybeSingle();

        if (existing) {
          details.push(`[inactivity] Skipped ${profile.email}: ${emailType} already sent.`);
          skipped++;
          continue;
        }
      }

      const name      = firstName(profile.full_name);
      const { subject: subjectRaw, body } = emailConfig(triggerDay, name);
      const subject   = isTest ? `[TEST] ${subjectRaw}` : subjectRaw;
      const recipient = isTest ? testEmail! : profile.email;

      await r.emails.send({
        from:    FROM,
        to:      recipient,
        subject,
        html:    emailTemplate(body),
      });

      if (!isTest) {
        await (db as any).from("email_logs").insert({
          user_id:    profile.id,
          email_type: emailType,
          sent_at:    now.toISOString(),
          metadata:   { email: profile.email, name, trigger_day: triggerDay },
        });
      }

      details.push(
        `[inactivity]${isTest ? "[TEST]" : ""} Sent ${emailType} to ${recipient} (patient: ${profile.full_name ?? profile.id})`
      );
      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      details.push(`[inactivity] Error for ${profile.email}: ${msg}`);
      console.error(`[inactivity] Failed for ${profile.email}:`, err);
      errors++;
    }
  }

  return { sent, skipped, errors, details };
}
