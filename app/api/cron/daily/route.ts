import { NextRequest, NextResponse } from "next/server";
import { runWelcomeSequence } from "../sequences/welcome";
import { runInactivitySequence } from "../sequences/inactivity";
import { runWeeklySummarySequence } from "../sequences/weekly-summary";
import { runPainAlertSequence } from "../sequences/pain-alert";

export const runtime = "nodejs";
export const maxDuration = 60; // Vercel Pro: up to 300s; Hobby: 60s

export async function GET(req: NextRequest) {
  // Verify Vercel Cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  console.log(`[cron/daily] Started at ${startedAt}`);

  const [welcome, inactivity, weeklySummary, painAlert] = await Promise.allSettled([
    runWelcomeSequence(),
    runInactivitySequence(),
    runWeeklySummarySequence(),
    runPainAlertSequence(),
  ]);

  const results = [
    { sequence: "welcome",        result: welcome },
    { sequence: "inactivity",     result: inactivity },
    { sequence: "weekly-summary", result: weeklySummary },
    { sequence: "pain-alert",     result: painAlert },
  ].map(({ sequence, result }) =>
    result.status === "fulfilled"
      ? { sequence, status: "ok",    ...result.value }
      : { sequence, status: "error", error: String((result as PromiseRejectedResult).reason) }
  );

  console.log("[cron/daily] Results:", JSON.stringify(results, null, 2));

  return NextResponse.json({ ok: true, ran_at: startedAt, results });
}
