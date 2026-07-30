import { NextResponse } from "next/server";
import { sendGmailMessage } from "@/lib/gmail";

export const runtime = "nodejs";

type Body = {
  to?: string;
  subject?: string;
  body?: string;
  attachments?: Array<{
    filename: string;
    mimeType: string;
    contentBase64: string;
  }>;
};

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Body;
    const to = data.to?.trim() || "";
    const subject = data.subject?.trim() || "";
    const body = data.body?.trim() || "";

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "to, subject, and body are required." },
        { status: 400 }
      );
    }

    const messageId = await sendGmailMessage({
      to,
      subject,
      body,
      attachments: data.attachments,
    });

    return NextResponse.json({ ok: true, messageId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send email.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
