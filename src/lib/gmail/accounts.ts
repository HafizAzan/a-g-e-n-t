import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import path from "path";
import type { StoredGmailTokens } from "@/lib/gmail/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const ACCOUNTS_PATH = path.join(DATA_DIR, "gmail-accounts.json");
const LEGACY_TOKEN_PATH = path.join(DATA_DIR, "gmail-tokens.json");

export type GmailAccountRecord = {
  id: string;
  email: string;
  picture?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string;
  token_type?: string | null;
  expiry_date?: number | null;
  connectedAt: string;
};

export type GmailAccountsStore = {
  defaultAccountId: string | null;
  accounts: GmailAccountRecord[];
};

function makeAccountId() {
  return `gmail_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readLegacyTokens(): Promise<StoredGmailTokens | null> {
  try {
    const raw = await readFile(LEGACY_TOKEN_PATH, "utf8");
    return JSON.parse(raw) as StoredGmailTokens;
  } catch {
    return null;
  }
}

async function migrateLegacyTokens(
  store: GmailAccountsStore
): Promise<GmailAccountsStore> {
  if (store.accounts.length > 0) return store;

  const legacy = await readLegacyTokens();
  if (!legacy?.refresh_token && !legacy?.access_token) return store;

  const account: GmailAccountRecord = {
    id: makeAccountId(),
    email: legacy.email || "unknown@gmail.com",
    access_token: legacy.access_token,
    refresh_token: legacy.refresh_token,
    scope: legacy.scope,
    token_type: legacy.token_type,
    expiry_date: legacy.expiry_date,
    connectedAt: new Date().toISOString(),
  };

  try {
    await unlink(LEGACY_TOKEN_PATH);
  } catch {
    // already removed
  }

  return {
    defaultAccountId: account.id,
    accounts: [account],
  };
}

export async function readAccountsStore(): Promise<GmailAccountsStore> {
  try {
    const raw = await readFile(ACCOUNTS_PATH, "utf8");
    const parsed = JSON.parse(raw) as GmailAccountsStore;
    const store: GmailAccountsStore = {
      defaultAccountId: parsed.defaultAccountId ?? null,
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
    };
    const migrated = await migrateLegacyTokens(store);
    if (migrated !== store) {
      await saveAccountsStore(migrated);
    }
    return migrated;
  } catch {
    const migrated = await migrateLegacyTokens({
      defaultAccountId: null,
      accounts: [],
    });
    if (migrated.accounts.length > 0) {
      await saveAccountsStore(migrated);
    }
    return migrated;
  }
}

export async function saveAccountsStore(store: GmailAccountsStore) {
  await ensureDataDir();
  await writeFile(ACCOUNTS_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function getAccountById(
  accountId: string
): Promise<GmailAccountRecord | null> {
  const store = await readAccountsStore();
  return store.accounts.find((a) => a.id === accountId) || null;
}

export async function getDefaultAccount(): Promise<GmailAccountRecord | null> {
  const store = await readAccountsStore();
  if (store.defaultAccountId) {
    const found = store.accounts.find((a) => a.id === store.defaultAccountId);
    if (found) return found;
  }
  return store.accounts[0] || null;
}

export async function upsertAccount(
  input: Omit<GmailAccountRecord, "id" | "connectedAt"> & {
    id?: string;
    connectedAt?: string;
  }
): Promise<GmailAccountRecord> {
  const store = await readAccountsStore();
  const existing = store.accounts.find((a) => a.email === input.email);

  const account: GmailAccountRecord = existing
    ? {
        ...existing,
        ...input,
        id: existing.id,
        refresh_token: input.refresh_token || existing.refresh_token,
        connectedAt: existing.connectedAt,
      }
    : {
        id: input.id || makeAccountId(),
        email: input.email,
        picture: input.picture,
        access_token: input.access_token,
        refresh_token: input.refresh_token,
        scope: input.scope,
        token_type: input.token_type,
        expiry_date: input.expiry_date,
        connectedAt: input.connectedAt || new Date().toISOString(),
      };

  const others = store.accounts.filter((a) => a.id !== account.id);
  const accounts = [...others, account];

  let defaultAccountId = store.defaultAccountId;
  if (!defaultAccountId || !accounts.some((a) => a.id === defaultAccountId)) {
    defaultAccountId = account.id;
  }

  await saveAccountsStore({ defaultAccountId, accounts });
  return account;
}

export async function removeAccount(accountId: string) {
  const store = await readAccountsStore();
  const accounts = store.accounts.filter((a) => a.id !== accountId);
  let defaultAccountId = store.defaultAccountId;

  if (defaultAccountId === accountId) {
    defaultAccountId = accounts[0]?.id ?? null;
  }

  await saveAccountsStore({ defaultAccountId, accounts });
}

export async function setDefaultAccount(accountId: string) {
  const store = await readAccountsStore();
  const exists = store.accounts.some((a) => a.id === accountId);
  if (!exists) {
    throw new Error("Account not found.");
  }
  await saveAccountsStore({ ...store, defaultAccountId: accountId });
}

export async function updateAccountTokens(
  accountId: string,
  tokens: Partial<GmailAccountRecord>
) {
  const store = await readAccountsStore();
  const accounts = store.accounts.map((a) =>
    a.id === accountId
      ? {
          ...a,
          ...tokens,
          refresh_token: tokens.refresh_token || a.refresh_token,
        }
      : a
  );
  await saveAccountsStore({ ...store, accounts });
}
