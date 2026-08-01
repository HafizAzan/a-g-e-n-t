import { NextResponse } from "next/server";
import { createOAuthClient, upsertAccount } from "@/lib/gmail";
import { google } from "googleapis";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const returnTo = searchParams.get("state") || "/outreach";

  const redirectBase = new URL(returnTo, request.url);

  if (oauthError) {
    redirectBase.searchParams.set("gmail", "error");
    redirectBase.searchParams.set("message", oauthError);
    return NextResponse.redirect(redirectBase);
  }

  if (!code) {
    redirectBase.searchParams.set("gmail", "error");
    redirectBase.searchParams.set("message", "missing_code");
    return NextResponse.redirect(redirectBase);
  }

  try {
    const client = createOAuthClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: client });
    const profile = await oauth2.userinfo.get();

    await upsertAccount({
      email: profile.data.email || "unknown@gmail.com",
      picture: profile.data.picture || null,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
    });

    redirectBase.searchParams.set("gmail", "connected");
    return NextResponse.redirect(redirectBase);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "OAuth callback failed";
    redirectBase.searchParams.set("gmail", "error");
    redirectBase.searchParams.set("message", message);
    return NextResponse.redirect(redirectBase);
  }
}
