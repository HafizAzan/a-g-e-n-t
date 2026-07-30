"use client";

import { OutreachPanel } from "@/components/outreach/outreach-panel";
import { useAppState } from "@/providers/app-state";

export function OutreachPageClient() {
  const { leads, selectedIndexes, gmailNotice } = useAppState();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-10">
      <header className="space-y-2 border-b border-border pb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Email Outreach
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Bulk Gmail outreach
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Connect Gmail, select leads from Lead Finder, generate drafts, then
          open Bulk Preview to review and approve.
        </p>
        {leads.length === 0 ? (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            No leads loaded yet. Generate or upload CSV from Lead Finder first.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {leads.length} leads available · {selectedIndexes.length} selected
          </p>
        )}
      </header>

      {gmailNotice ? (
        <p className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
          {gmailNotice}
        </p>
      ) : null}

      <OutreachPanel />
    </div>
  );
}
