import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password || password.length < 8) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Validate token — not used, not expired
    const { data: invitation, error: invErr } = await adminClient
      .from("invitations")
      .select("*")
      .eq("token", token)
      .single();

    if (invErr || !invitation) {
      return NextResponse.json({ error: "Token inválido" }, { status: 404 });
    }
    if (invitation.used) {
      return NextResponse.json({ error: "Este link ya fue usado" }, { status: 410 });
    }
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: "Este link ha expirado" }, { status: 410 });
    }

    const email: string = invitation.email;
    let userId: string;

    // 2. Create or update the auth user
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skip email verification — admin already vetted them
    });

    if (createError) {
      const alreadyExists =
        createError.message.toLowerCase().includes("already") ||
        createError.message.toLowerCase().includes("registered") ||
        createError.message.toLowerCase().includes("exists");

      if (!alreadyExists) {
        console.error("[activate] createUser error:", createError.message);
        return NextResponse.json({ error: "Error creando cuenta" }, { status: 500 });
      }

      // User exists — find their ID then update their password
      // Try profiles table first (fast path)
      const { data: profileRow } = await adminClient
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (profileRow?.id) {
        userId = profileRow.id;
      } else {
        // Fallback: scan auth users (small dataset — clinical app)
        const { data: listData } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
        const existing = listData?.users.find((u) => u.email === email);
        if (!existing) {
          return NextResponse.json({ error: "No se pudo localizar la cuenta" }, { status: 500 });
        }
        userId = existing.id;
      }

      // Set the new password
      const { error: updateErr } = await adminClient.auth.admin.updateUserById(userId, { password });
      if (updateErr) {
        console.error("[activate] updateUserById error:", updateErr.message);
        return NextResponse.json({ error: "Error actualizando contraseña" }, { status: 500 });
      }
    } else {
      userId = createData.user.id;
    }

    // 3. Upsert profile (handles both new and existing users)
    const { error: profileErr } = await adminClient.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: (invitation as any).name || null,
        role: "patient",
        access_active: true,
        access_type: invitation.access_type || "paid",
      },
      { onConflict: "id" }
    );

    if (profileErr) {
      console.error("[activate] profile upsert error:", profileErr.message);
      // Non-fatal — session will still be established
    }

    // 4. Mark invitation as used
    await adminClient.from("invitations").update({ used: true }).eq("token", token);

    // Return email so client can sign in immediately
    return NextResponse.json({ success: true, email });
  } catch (err) {
    console.error("[activate] Unexpected error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
