"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GmailStatus } from "@/types/outreach";
import { Check, Mail, Plus, RefreshCw, Send, Trash2 } from "lucide-react";

const EMPTY_STATUS: GmailStatus = {
  connected: false,
  accounts: [],
  defaultAccountId: null,
};

export function ConnectGmailCard() {
  const [status, setStatus] = useState<GmailStatus>(EMPTY_STATUS);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);

      const res = await fetch("/api/gmail/status", {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const data = (await res.json()) as GmailStatus & { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load Gmail status.");
      setStatus({
        connected: data.connected,
        accounts: data.accounts || [],
        defaultAccountId: data.defaultAccountId,
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Gmail status timed out. You can still connect — click Connect Gmail.");
      } else {
        setError(err instanceof Error ? err.message : "Gmail status error.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const params = new URLSearchParams(window.location.search);
    const gmail = params.get("gmail");
    if (gmail === "connected") {
      setNotice("Gmail connected successfully.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (gmail === "error") {
      setNotice(
        `Gmail connection failed: ${params.get("message") || "unknown error"}`
      );
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [refresh]);

  async function setDefault(accountId: string) {
    setActionLoading(accountId);
    try {
      const res = await fetch("/api/gmail/default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const data = (await res.json()) as GmailStatus & { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to set default.");
      setStatus({
        connected: data.connected,
        accounts: data.accounts || [],
        defaultAccountId: data.defaultAccountId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set default.");
    } finally {
      setActionLoading(null);
    }
  }

  async function disconnect(accountId: string) {
    setActionLoading(accountId);
    try {
      const res = await fetch("/api/gmail/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const data = (await res.json()) as GmailStatus & { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to disconnect.");
      setStatus({
        connected: data.connected,
        accounts: data.accounts || [],
        defaultAccountId: data.defaultAccountId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed.");
    } finally {
      setActionLoading(null);
    }
  }

  async function sendTest(accountId?: string) {
    setActionLoading("test");
    setError(null);
    try {
      const res = await fetch("/api/gmail/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        to?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Test send failed.");
      setNotice(`Test email sent to ${data.to || "your inbox"}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test send failed.");
    } finally {
      setActionLoading(null);
    }
  }

  const defaultAccount = status.accounts.find(
    (a) => a.id === status.defaultAccountId
  );

  return (
    <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Gmail Connection</h2>
            <p className="text-sm text-muted-foreground">
              OAuth only. Tokens stay on the server and never reach the browser.
            </p>
            <Badge variant={status.connected ? "sent" : "pending"}>
              {status.connected ? "Connected" : "Not connected"}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => {
                window.location.href =
                  "/api/gmail/auth?returnTo=" +
                  encodeURIComponent("/outreach");
              }}
            >
              <Plus />
              {loading
                ? "Connect Gmail"
                : status.accounts.length > 0
                  ? "Connect Another Gmail"
                  : "Connect Gmail"}
            </Button>
            {status.connected ? (
              <Button
                type="button"
                variant="secondary"
                disabled={loading || actionLoading === "test"}
                onClick={() => void sendTest(defaultAccount?.id)}
              >
                <Send />
                {actionLoading === "test" ? "Sending..." : "Send Test Email"}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              disabled={loading}
              onClick={() => void refresh()}
            >
              <RefreshCw className={loading ? "animate-spin" : undefined} />
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </div>

        {notice ? (
          <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {notice}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        {status.accounts.length > 0 ? (
          <div className="space-y-4">
            <div>
              <h3 className="mb-3 text-sm font-medium">Connected Accounts</h3>
              <div className="space-y-2">
                {status.accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {account.picture ? (
                        <Image
                          src={account.picture}
                          alt=""
                          width={36}
                          height={36}
                          className="rounded-full"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                          <Mail className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="flex items-center gap-2 font-medium">
                          {account.connected ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : null}
                          {account.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {account.connected ? "Active" : "Needs reconnect"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {account.isDefault ? (
                        <Badge variant="approved">Default sender</Badge>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === account.id}
                          onClick={() => void setDefault(account.id)}
                        >
                          Set as default
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={actionLoading === account.id}
                        onClick={() => void disconnect(account.id)}
                      >
                        <Trash2 />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {defaultAccount ? (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Default Sender
                </p>
                <p className="mt-1 flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-emerald-400" />
                  {defaultAccount.email}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No Gmail accounts connected yet.
          </p>
        )}
      </div>
    </section>
  );
}
