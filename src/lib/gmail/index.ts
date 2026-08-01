export { createOAuthClient, getAuthUrl, getGoogleConfig } from "@/lib/gmail/oauth";
export {
  readAccountsStore,
  getAccountById,
  getDefaultAccount,
  upsertAccount,
  removeAccount,
  setDefaultAccount,
} from "@/lib/gmail/accounts";
export { getGmailStatus } from "@/lib/gmail/status";
export { sendGmailMessage } from "@/lib/gmail/service";
export type { GmailAccountPublic, GmailStatusResponse } from "@/lib/gmail/types";
