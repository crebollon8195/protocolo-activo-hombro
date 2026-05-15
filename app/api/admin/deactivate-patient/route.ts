import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { createServerClient } from "@/lib/supabase-server";

async function getAdminUserId(req: NextRequest): Promise<string | null> {
  const adminClient = createAdminClient();
  const authHeader = req.headers.get("Authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  let userId: string | null = null;
  if (bearer) {
    const { data } = await adminClient.auth.getUser(bearer);
    userId = data.user?.id ?? null;
  } else {
    const { data } = await createServerClient().auth.getUser();
    userId = data.user?.id ?? null;
  }
  if (!userId) return null;

  const { data: profile } = await adminClient.from("profiles").select("role").eq("id", userId).single();
  return profile?.role === "admin" ? userId : null;
}

export async function POST(req: NextRequest) {
  const adminId = await getAdminUserId(req);
  if (!adminId) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { patientId } = await req.json();
  if (!patientId) return NextResponse.json({ error: "patientId requerido" }, { status: 400 });

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({ access_active: false })
    .eq("id", patientId);

  if (error) {
    console.error("[deactivate-patient] error:", error.message);
    return NextResponse.json({ error: "Error desactivando paciente" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
