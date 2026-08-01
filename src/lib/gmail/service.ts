import { google } from "googleapis";
import { createOAuthClient } from "@/lib/gmail/oauth";
import {
  getAccountById,
  getDefaultAccount,
  updateAccountTokens,
  type GmailAccountRecord,
} from "@/lib/gmail/accounts";

function encodeSubject(subject: string) {
  return `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;
}

function toBase64Url(raw: string) {
  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function getAuthorizedClientForAccount(account: GmailAccountRecord) {
  if (!account.refresh_token && !account.access_token) {
    throw new Error(`Gmail account ${account.email} is not connected.`);
  }

  const client = createOAuthClient();
  client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    scope: account.scope,
    token_type: account.token_type,
    expiry_date: account.expiry_date,
  });

  client.on("tokens", async (fresh) => {
    await updateAccountTokens(account.id, {
      access_token: fresh.access_token,
      refresh_token: fresh.refresh_token || account.refresh_token,
      scope: fresh.scope,
      token_type: fresh.token_type,
      expiry_date: fresh.expiry_date,
    });
  });

  return client;
}

type SendEmailInput = {
  accountId?: string;
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    mimeType: string;
    contentBase64: string;
  }>;
};

export async function sendGmailMessage(input: SendEmailInput) {
  const account = input.accountId
    ? await getAccountById(input.accountId)
    : await getDefaultAccount();

  if (!account) {
    throw new Error("No Gmail account connected. Click Connect Gmail first.");
  }

  const auth = await getAuthorizedClientForAccount(account);
  const gmail = google.gmail({ version: "v1", auth });
  const boundary = `mixed_${Date.now()}`;
  const hasAttachments = Boolean(input.attachments?.length);

  let mime = "";

  if (!hasAttachments) {
    mime = [
      `To: ${input.to}`,
      `Subject: ${encodeSubject(input.subject)}`,
      "MIME-Version: 1.0",
      'Content-Type: text/plain; charset="UTF-8"',
      "",
      input.body,
    ].join("\r\n");
  } else {
    const parts = [
      `To: ${input.to}`,
      `Subject: ${encodeSubject(input.subject)}`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 7bit",
      "",
      input.body,
      "",
    ];

    for (const file of input.attachments || []) {
      parts.push(
        `--${boundary}`,
        `Content-Type: ${file.mimeType}; name="${file.filename}"`,
        "Content-Transfer-Encoding: base64",
        `Content-Disposition: attachment; filename="${file.filename}"`,
        "",
        file.contentBase64,
        ""
      );
    }

    parts.push(`--${boundary}--`);
    mime = parts.join("\r\n");
  }

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: toBase64Url(mime),
    },
  });

  return {
    messageId: res.data.id || null,
    fromEmail: account.email,
    accountId: account.id,
  };
}
