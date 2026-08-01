import { NextResponse } from "next/server";
import { generatePersonalizedEmails } from "@/lib/email-ai";
import type { Lead } from "@/types/lead";
import type { EmailTemplate } from "@/types/outreach";

export const runtime = "nodejs";
export const maxDuration = 300;

type Body = {
  lead?: Lead & { leadIndex: number };
  template?: EmailTemplate;
  senderName?: string;
};

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Body;
    const lead = data.lead;
    const template = data.template;

    if (!template) {
      return NextResponse.json(
        { error: "template is required." },
        { status: 400 }
      );
    }
    if (!lead) {
      return NextResponse.json({ error: "lead is required." }, { status: 400 });
    }

    const emails = await generatePersonalizedEmails({
      leads: [lead],
      template,
      senderName: data.senderName || "Your Name",
    });

    const email = emails[0];
    if (!email) {
      return NextResponse.json(
        { error: "AI did not return an email." },
        { status: 502 }
      );
    }

    return NextResponse.json({ email });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to regenerate email.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
