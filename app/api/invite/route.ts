import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendInvitationEmail, sendAdminInvitationConfirmation } from "@/lib/email";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    // Verify caller is admin
    const serverClient = createServerClient();
    const { data: { session } } = await serverClient.auth.getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data: profile } = await serverClient.from("profiles").select("role").eq("id", session.user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const body = await req.json();
    const { email, full_name, access_type, duration_days, label, request_id } = body;

    const adminClient = createAdminClient();

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
      return NextResponse.json({ error: "Error creando invitación" }, { status: 500 });
    }

    // Update access_request status if provided
    if (request_id) {
      await adminClient.from("access_requests").update({ status: "approved" }).eq("id", request_id);
    }

    // Send invitation email to patient
    await sendInvitationEmail({ email, full_name, token, access_type: access_type || "paid", duration_days: duration_days || 42 });

    // Notify admin
    await sendAdminInvitationConfirmation({ patient_name: full_name, patient_email: email });

    return NextResponse.json({ success: true, token });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
