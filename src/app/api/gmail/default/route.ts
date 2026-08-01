import { NextResponse } from "next/server";
import { getGmailStatus, setDefaultAccount } from "@/lib/gmail";

export const runtime = "nodejs";

type Body = {
  accountId?: string;
};

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Body;
    const accountId = data.accountId?.trim();

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required." },
        { status: 400 }
      );
    }

    await setDefaultAccount(accountId);
    const status = await getGmailStatus();
    return NextResponse.json(status);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to set default sender.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
