import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { createServerClient } from "@/lib/supabase-server";
import { sendInvitationEmail, sendAdminInvitationConfirmation } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const adminClient = createAdminClient();

    // Prefer token from Authorization header; fall back to cookie-based session
    let user = null;
    const authHeader = req.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (bearerToken) {
      const { data, error } = await adminClient.auth.getUser(bearerToken);
      if (error || !data.user) {
        return NextResponse.json({ error: "Token inválido" }, { status: 401 });
      }
      user = data.user;
    } else {
      const serverClient = createServerClient();
      const { data } = await serverClient.auth.getUser();
      if (!data.user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      user = data.user;
    }

    // Verify role with admin client to bypass RLS
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { email, full_name, access_type, duration_days, label, request_id } = body;

    // Generate unique token
    const token = crypto.randomUUID();
    const expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    // Save invitation
    const { error: inviteError } = await adminClient.from("invitations").insert({
      email,
      token,
      used: false,
      expires_at,
      access_type: access_type || "paid",
      access_duration_days: duration_days || 42,
      label: label || null,
    });

    if (inviteError) {
      console.error("Invite insert error:", JSON.stringify(inviteError));
      return NextResponse.json({ error: "Error creando invitación" }, { status: 500 });
    }

    // Update access_request status if provided
    if (request_id) {
      await adminClient.from("access_requests").update({ status: "approved" }).eq("id", request_id);
    }

    // Verify RESEND_API_KEY is present
    const resendKey = process.env.RESEND_API_KEY;
    console.log("[invite] RESEND_API_KEY present:", !!resendKey, "| prefix:", resendKey?.slice(0, 8));

    // Send invitation email to patient
    console.log("[invite] Sending patient email to:", email, "token:", token);
    try {
      const emailResult = await sendInvitationEmail({
        email,
        full_name,
        token,
        access_type: access_type || "paid",
        duration_days: duration_days || 42,
      });
      console.log("[invite] Patient email result:", JSON.stringify(emailResult));
    } catch (emailErr) {
      console.error("[invite] Patient email FAILED:", emailErr);
      // Still return success — invitation is in DB; email failure is logged
      return NextResponse.json({ success: true, token, warning: "email_failed" });
    }

    // Notify admin (non-blocking — don't fail the request if this fails)
    console.log("[invite] Sending admin confirmation email");
    sendAdminInvitationConfirmation({ patient_name: full_name, patient_email: email })
      .then((r) => console.log("[invite] Admin confirmation result:", JSON.stringify(r)))
      .catch((err) => console.error("[invite] Admin confirmation FAILED:", err));

    return NextResponse.json({ success: true, token });
  } catch (err) {
    console.error("Unexpected error in /api/invite:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
