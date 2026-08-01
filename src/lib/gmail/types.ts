/** @deprecated Legacy single-account token shape — migrated automatically. */
export type StoredGmailTokens = {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string;
  token_type?: string | null;
  expiry_date?: number | null;
  email?: string | null;
};

export type GmailAccountPublic = {
  id: string;
  email: string;
  picture: string | null;
  connected: boolean;
  isDefault: boolean;
};

export type GmailStatusResponse = {
  connected: boolean;
  accounts: GmailAccountPublic[];
  defaultAccountId: string | null;
};
