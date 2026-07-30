import { NextResponse } from "next/server";
import { getGmailStatus } from "@/lib/gmail";

export const runtime = "nodejs";

export async function GET() {
  try {
    const status = await getGmailStatus();
    return NextResponse.json(status);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to read Gmail status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
