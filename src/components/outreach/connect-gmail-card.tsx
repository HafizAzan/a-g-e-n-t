"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GmailStatus } from "@/types/outreach";

export function ConnectGmailCard() {
  const [status, setStatus] = useState<GmailStatus>({
    connected: false,
    email: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gmail/status");
      const data = (await res.json()) as GmailStatus & { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load Gmail status.");
      setStatus({ connected: data.connected, email: data.email });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gmail status error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function disconnect() {
    setLoading(true);
    try {
      await fetch("/api/gmail/disconnect", { method: "POST" });
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Connect Gmail</h2>
          <p className="text-sm text-muted-foreground">
            OAuth only. Tokens stay on the server and never reach the browser.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant={status.connected ? "sent" : "pending"}>
              {status.connected ? "Connected" : "Not connected"}
            </Badge>
            {status.email ? (
              <span className="text-sm text-foreground">{status.email}</span>
            ) : (
              <span className="text-sm text-muted-foreground">
                No account linked
              </span>
            )}
          </div>
          {error ? (
            <p className="text-sm text-red-300">{error}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {status.connected ? (
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => void disconnect()}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              type="button"
              disabled={loading}
              onClick={() => {
                window.location.href = "/api/gmail/auth";
              }}
            >
              Connect Gmail
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => void refresh()}
          >
            Refresh
          </Button>
        </div>
      </div>
    </section>
  );
}
