import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendAccessRequestNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { first_name, last_name, email, phone, how_found } = body;

    if (!first_name || !last_name || !email) {
      return NextResponse.json({ error: "Nombre, apellido y email son requeridos" }, { status: 400 });
    }

    const full_name = `${first_name.trim()} ${last_name.trim()}`;
    const supabase = createAdminClient();

    // Try inserting with first_name + last_name columns.
    // Falls back to full_name only if the columns don't exist yet in the DB.
    let dbError: { message: string; code?: string } | null = null;

    const withSplit = await supabase
      .from("access_requests")
      .insert({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        full_name,
        email,
        phone: phone || null,
        how_found: how_found || null,
        status: "pending",
      });

    if (withSplit.error) {
      // 42703 = undefined column — columns not added yet, fall back
      if (withSplit.error.code === "42703") {
        console.warn("first_name/last_name columns missing — run SQL migration. Falling back to full_name only.");

        const fallback = await supabase
          .from("access_requests")
          .insert({
            full_name,
            email,
            phone: phone || null,
            how_found: how_found || null,
            status: "pending",
          } as never); // bypass type check for fallback

        if (fallback.error) {
          dbError = fallback.error;
        }
      } else {
        dbError = withSplit.error;
      }
    }

    if (dbError) {
      console.error("DB insert error:", JSON.stringify(dbError));
      return NextResponse.json(
        { error: "Error guardando solicitud", detail: dbError.message },
        { status: 500 }
      );
    }

    await sendAccessRequestNotification({ full_name, email, phone, how_found });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error in /api/access-request:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
