import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendAccessRequestNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, email, phone, how_found } = body;

    if (!full_name || !email) {
      return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Save to access_requests table
    const { error: dbError } = await supabase
      .from("access_requests")
      .insert({ full_name, email, phone: phone || null, how_found: how_found || null });

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json({ error: "Error guardando solicitud" }, { status: 500 });
    }

    // Notify admin via email
    await sendAccessRequestNotification({ full_name, email, phone, how_found });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
