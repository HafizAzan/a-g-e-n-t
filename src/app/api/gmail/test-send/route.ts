import { NextResponse } from "next/server";
import { getDefaultAccount, sendGmailMessage } from "@/lib/gmail";

export const runtime = "nodejs";

type Body = {
  accountId?: string;
  to?: string;
};

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Body;
    const account = data.accountId
      ? await import("@/lib/gmail/accounts").then((m) =>
          m.getAccountById(data.accountId!)
        )
      : await getDefaultAccount();

    if (!account) {
      return NextResponse.json(
        { error: "No Gmail account connected." },
        { status: 400 }
      );
    }

    const to = data.to?.trim() || account.email;
    const subject = "Gmail Outreach — Test Email";
    const body = [
      "This is a test email from your AI Lead Finder outreach system.",
      "",
      `Sent from: ${account.email}`,
      `Time: ${new Date().toLocaleString()}`,
      "",
      "If you received this, Gmail OAuth is working correctly.",
    ].join("\n");

    const result = await sendGmailMessage({
      accountId: account.id,
      to,
      subject,
      body,
    });

    return NextResponse.json({
      ok: true,
      messageId: result.messageId,
      fromEmail: result.fromEmail,
      to,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send test email.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
