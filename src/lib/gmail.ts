import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import path from "path";
import { google } from "googleapis";

const DATA_DIR = path.join(process.cwd(), ".data");
const TOKEN_PATH = path.join(DATA_DIR, "gmail-tokens.json");

export type StoredGmailTokens = {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string;
  token_type?: string | null;
  expiry_date?: number | null;
  email?: string | null;
};

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    "http://localhost:3000/api/gmail/callback";

  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required in .env.local"
    );
  }

  return { clientId, clientSecret, redirectUri };
}

export function createOAuthClient() {
  const { clientId, clientSecret, redirectUri } = getGoogleConfig();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthUrl() {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
}

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readTokens(): Promise<StoredGmailTokens | null> {
  try {
    const raw = await readFile(TOKEN_PATH, "utf8");
    return JSON.parse(raw) as StoredGmailTokens;
  } catch {
    return null;
  }
}

export async function saveTokens(tokens: StoredGmailTokens) {
  await ensureDataDir();
  await writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2), "utf8");
}

export async function clearTokens() {
  try {
    await unlink(TOKEN_PATH);
  } catch {
    // already gone
  }
}

export async function getAuthorizedClient() {
  const tokens = await readTokens();
  if (!tokens?.refresh_token && !tokens?.access_token) {
    throw new Error("Gmail is not connected. Click Connect Gmail first.");
  }

  const client = createOAuthClient();
  client.setCredentials(tokens);

  client.on("tokens", async (fresh) => {
    const current = (await readTokens()) || {};
    await saveTokens({
      ...current,
      ...fresh,
      refresh_token: fresh.refresh_token || current.refresh_token,
      email: current.email,
    });
  });

  return client;
}

export async function getGmailStatus() {
  const tokens = await readTokens();
  if (!tokens?.access_token && !tokens?.refresh_token) {
    return { connected: false, email: null as string | null };
  }

  try {
    const auth = await getAuthorizedClient();
    const oauth2 = google.oauth2({ version: "v2", auth });
    const profile = await oauth2.userinfo.get();
    const email = profile.data.email || tokens.email || null;

    if (email && email !== tokens.email) {
      await saveTokens({ ...tokens, email });
    }

    return { connected: true, email };
  } catch {
    return {
      connected: Boolean(tokens.refresh_token || tokens.access_token),
      email: tokens.email || null,
    };
  }
}

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

type SendEmailInput = {
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
  const auth = await getAuthorizedClient();
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

  return res.data.id || null;
}
