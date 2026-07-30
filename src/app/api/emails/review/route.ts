import { NextResponse } from "next/server";
import { reviewEmailsWithAi } from "@/lib/email-ai";
import type { Lead } from "@/types/lead";

export const runtime = "nodejs";
export const maxDuration = 300;

type Body = {
  drafts?: Array<{
    id: string;
    subject: string;
    body: string;
    lead: Lead;
  }>;
};

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Body;
    const drafts = data.drafts || [];

    if (drafts.length === 0) {
      return NextResponse.json(
        { error: "No drafts to review." },
        { status: 400 }
      );
    }

    const reviews = await reviewEmailsWithAi(drafts);
    return NextResponse.json({ reviews });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to review emails.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
