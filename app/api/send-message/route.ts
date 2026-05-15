import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { createServerClient } from "@/lib/supabase-server";
import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return new Resend(key);
}

export async function POST(req: NextRequest) {
  try {
    const adminClient = createAdminClient();

    // Auth — accept Bearer token (from client) or cookie (from server)
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (bearerToken) {
      const { data } = await adminClient.auth.getUser(bearerToken);
      userId = data.user?.id ?? null;
    } else {
      const serverClient = createServerClient();
      const { data } = await serverClient.auth.getUser();
      userId = data.user?.id ?? null;
    }

    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const { patientEmail, patientName, message } = await req.json();
    if (!patientEmail || !message?.trim()) {
      return NextResponse.json({ error: "Email y mensaje son requeridos" }, { status: 400 });
    }

    const resend = getResend();
    await resend.emails.send({
      from: "Dr. Carlos Rebollón <noreply@drcarlosrebollon.com>",
      to: patientEmail,
      subject: "Mensaje del Dr. Carlos Rebollón - Protocolo Activo de Hombro",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #0170B9; padding: 20px 24px; border-radius: 12px 12px 0 0;">
            <h2 style="color: white; margin: 0; font-size: 18px;">Protocolo Activo de Hombro</h2>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Dr. Carlos Rebollón · Ortopedia y Traumatología</p>
          </div>
          <div style="background: white; padding: 24px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 16px;">Estimado/a <strong>${patientName || "paciente"}</strong>,</p>
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 3px solid #0170B9;">
              <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p>
            </div>
            <p style="margin: 16px 0 0; color: #666; font-size: 14px;">Atentamente,</p>
            <p style="margin: 4px 0; font-weight: bold;">Dr. Carlos Rebollón</p>
            <p style="margin: 0; color: #0170B9; font-size: 13px;">drcarlosrebollon.com</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-message] error:", err);
    return NextResponse.json({ error: "Error enviando mensaje" }, { status: 500 });
  }
}
