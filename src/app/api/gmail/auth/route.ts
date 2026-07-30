import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/gmail";

export const runtime = "nodejs";

export async function GET() {
  try {
    const url = getAuthUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start Gmail OAuth.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
