import { NextResponse } from "next/server";
import { createOAuthClient, saveTokens } from "@/lib/gmail";
import { google } from "googleapis";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      new URL(`/?gmail=error&message=${encodeURIComponent(oauthError)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/?gmail=error&message=missing_code", request.url)
    );
  }

  try {
    const client = createOAuthClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: client });
    const profile = await oauth2.userinfo.get();

    await saveTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
      email: profile.data.email || null,
    });

    return NextResponse.redirect(new URL("/?gmail=connected", request.url));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "OAuth callback failed";
    return NextResponse.redirect(
      new URL(
        `/?gmail=error&message=${encodeURIComponent(message)}`,
        request.url
      )
    );
  }
}
