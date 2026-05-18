import { NextRequest, NextResponse } from "next/server";
import { runWelcomeSequence } from "../sequences/welcome";
import { runInactivitySequence } from "../sequences/inactivity";
import { runWeeklySummarySequence } from "../sequences/weekly-summary";
import { runPainAlertSequence } from "../sequences/pain-alert";

export const runtime    = "nodejs";
export const maxDuration = 60;

const VALID_SEQUENCES = ["welcome", "inactivity", "weekly", "pain_alert"] as const;
type SequenceName = (typeof VALID_SEQUENCES)[number];

export async function POST(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "Server misconfiguration: CRON_SECRET not set" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { secret, sequence, test_email } =
    (body as { secret?: unknown; sequence?: unknown; test_email?: unknown }) ?? {};

  if (secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Validate inputs ─────────────────────────────────────────────────────────
  if (!sequence || !VALID_SEQUENCES.includes(sequence as SequenceName)) {
    return NextResponse.json(
      {
        error: `Invalid sequence. Must be one of: ${VALID_SEQUENCES.join(", ")}`,
        valid_sequences: VALID_SEQUENCES,
      },
      { status: 400 }
    );
  }

  if (!test_email || typeof test_email !== "string" || !test_email.includes("@")) {
    return NextResponse.json(
      { error: "test_email is required and must be a valid email address" },
      { status: 400 }
    );
  }

  const seq        = sequence as SequenceName;
  const testEmail  = test_email as string;
  const startedAt  = new Date().toISOString();

  console.log(`[cron/test] Running sequence="${seq}" → test_email="${testEmail}" at ${startedAt}`);

  // ── Run the requested sequence ───────────────────────────────────────────────
  try {
    let result;

    switch (seq) {
      case "welcome":
        result = await runWelcomeSequence(testEmail);
        break;
      case "inactivity":
        result = await runInactivitySequence(testEmail);
        break;
      case "weekly":
        result = await runWeeklySummarySequence(testEmail);
        break;
      case "pain_alert":
        result = await runPainAlertSequence(testEmail);
        break;
    }

    console.log(`[cron/test] Done:`, JSON.stringify(result, null, 2));

    return NextResponse.json({
      success:     true,
      sequence:    seq,
      test_email:  testEmail,
      ran_at:      startedAt,
      emails_sent: result.sent,
      skipped:     result.skipped,
      errors:      result.errors,
      details:     result.details,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[cron/test] Sequence "${seq}" threw:`, err);

    return NextResponse.json(
      {
        success:   false,
        sequence:  seq,
        ran_at:    startedAt,
        error:     message,
      },
      { status: 500 }
    );
  }
}
