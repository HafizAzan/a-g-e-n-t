import { NextResponse } from "next/server";
import { clearTokens } from "@/lib/gmail";

export const runtime = "nodejs";

export async function POST() {
  try {
    await clearTokens();
    return NextResponse.json({ connected: false, email: null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to disconnect Gmail.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
