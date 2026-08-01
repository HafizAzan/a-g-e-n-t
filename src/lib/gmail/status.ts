import { readAccountsStore } from "@/lib/gmail/accounts";
import type { GmailStatusResponse } from "@/lib/gmail/types";

/** Fast status check — reads local token file only, no Google API calls. */
export async function getGmailStatus(): Promise<GmailStatusResponse> {
  const store = await readAccountsStore();

  const accounts = store.accounts.map((account) => ({
    id: account.id,
    email: account.email,
    picture: account.picture || null,
    connected: Boolean(account.refresh_token || account.access_token),
    isDefault: account.id === store.defaultAccountId,
  }));

  return {
    connected: accounts.some((a) => a.connected),
    accounts,
    defaultAccountId: store.defaultAccountId,
  };
}
