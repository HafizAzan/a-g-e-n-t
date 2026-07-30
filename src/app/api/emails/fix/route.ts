import { NextResponse } from "next/server";
import { fixEmailWithAi } from "@/lib/email-ai";
import type { Lead } from "@/types/lead";

export const runtime = "nodejs";
export const maxDuration = 300;

type Body = {
  subject?: string;
  body?: string;
  greeting?: string;
  introduction?: string;
  offer?: string;
  callToAction?: string;
  signature?: string;
  reviewNotes?: string;
  lead?: Lead;
};

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Body;

    if (!data.lead || !data.subject || !data.body) {
      return NextResponse.json(
        { error: "lead, subject, and body are required." },
        { status: 400 }
      );
    }

    const fixed = await fixEmailWithAi({
      subject: data.subject,
      body: data.body,
      greeting: data.greeting || "",
      introduction: data.introduction || "",
      offer: data.offer || "",
      callToAction: data.callToAction || "",
      signature: data.signature || "",
      reviewNotes: data.reviewNotes || "Improve this email.",
      lead: data.lead,
    });

    return NextResponse.json({ email: fixed });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fix email.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
