import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendInvitationEmail, sendWebhookPatientNotification } from "@/lib/email";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.WOOCOMMERCE_WEBHOOK_SECRET || "";

function verifyWooCommerceSignature(body: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return true; // skip verification if secret not configured
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = Buffer.from(hmac.update(body).digest("base64"), "base64");
  const checksum = Buffer.from(signature, "base64");
  if (digest.length !== checksum.length) return false;
  return crypto.timingSafeEqual(digest, checksum);
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-wc-webhook-signature") || "";

    if (WEBHOOK_SECRET && !verifyWooCommerceSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // WooCommerce order.completed webhook payload
    const status = payload.status;
    if (status !== "completed" && status !== "processing") {
      return NextResponse.json({ received: true, skipped: "non-completed order" });
    }

    const billing = payload.billing || {};
    const email = billing.email;
    const firstName = billing.first_name || "";
    const lastName = billing.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim() || email;
    const orderId = String(payload.id || payload.order_id || "");

    if (!email) {
      return NextResponse.json({ error: "No email in payload" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Check if patient already has a pending/used invitation
    const { data: existing } = await adminClient
      .from("invitations")
      .select("id, used")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existing && !existing.used) {
      // Already has a valid pending invitation — notify admin but don't duplicate
      await sendWebhookPatientNotification({ patient_name: fullName, patient_email: email, order_id: orderId });
      return NextResponse.json({ received: true, note: "existing invitation found" });
    }

    // Generate invitation token (48h, paid access, 42 days)
    const token = crypto.randomUUID();
    const expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { error: inviteError } = await adminClient.from("invitations").insert({
      email,
      token,
      used: false,
      expires_at,
      access_type: "paid",
      access_duration_days: 42,
      label: `WooCommerce #${orderId}`,
    });

    if (inviteError) {
      console.error("Invitation insert error:", inviteError);
      return NextResponse.json({ error: "Error creating invitation" }, { status: 500 });
    }

    // Send activation email to patient
    await sendInvitationEmail({
      email,
      full_name: fullName,
      token,
      access_type: "paid",
      duration_days: 42,
    });

    // Notify admin
    await sendWebhookPatientNotification({ patient_name: fullName, patient_email: email, order_id: orderId });

    return NextResponse.json({ received: true, success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
