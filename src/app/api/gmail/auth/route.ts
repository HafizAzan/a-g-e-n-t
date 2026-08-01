import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/gmail";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const returnTo = searchParams.get("returnTo") || "/outreach";
    const url = getAuthUrl(returnTo);
    return NextResponse.redirect(url);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start Gmail OAuth.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
