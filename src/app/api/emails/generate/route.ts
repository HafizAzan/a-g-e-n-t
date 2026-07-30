import { NextResponse } from "next/server";
import { generatePersonalizedEmails } from "@/lib/email-ai";
import type { Lead } from "@/types/lead";
import type { EmailTemplate } from "@/types/outreach";

export const runtime = "nodejs";
export const maxDuration = 300;

type Body = {
  leads?: Array<Lead & { leadIndex: number }>;
  template?: EmailTemplate;
  senderName?: string;
};

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Body;
    const leads = data.leads || [];
    const template = data.template;

    if (!template) {
      return NextResponse.json(
        { error: "template is required." },
        { status: 400 }
      );
    }
    if (leads.length === 0) {
      return NextResponse.json(
        { error: "Select at least one lead." },
        { status: 400 }
      );
    }

    const emails = await generatePersonalizedEmails({
      leads,
      template,
      senderName: data.senderName || "Your Name",
    });

    return NextResponse.json({ emails });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate emails.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
