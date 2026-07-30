"use client";

import { DownloadCsvButton } from "@/components/download-csv-button";
import { UploadCsvButton } from "@/components/upload-csv-button";
import { LeadForm, type LeadFormValues } from "@/components/lead-form";
import { LeadsTable } from "@/components/leads-table";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/types/lead";
import type { EmailSendStatus } from "@/types/outreach";
import { Mail } from "lucide-react";

type LeadsViewProps = {
  values: LeadFormValues;
  leads: Lead[];
  selectedIndexes: number[];
  statusByIndex: Record<number, EmailSendStatus>;
  loading: boolean;
  error: string | null;
  gmailNotice: string | null;
  onValuesChange: (values: LeadFormValues) => void;
  onGenerate: () => void;
  onToggle: (index: number) => void;
  onToggleAll: () => void;
  onUploadLeads: (leads: Lead[]) => void;
  onError: (message: string) => void;
  onOpenOutreach: () => void;
};

export function LeadsView({
  values,
  leads,
  selectedIndexes,
  statusByIndex,
  loading,
  error,
  gmailNotice,
  onValuesChange,
  onGenerate,
  onToggle,
  onToggleAll,
  onUploadLeads,
  onError,
  onOpenOutreach,
}: LeadsViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
      <header className="space-y-3 border-b border-border pb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Lead Finder
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Generate or upload leads
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Enter prompt, country, city, and limit — or upload a CSV. Results
          appear in the same table. Use the sidebar for Email Outreach.
        </p>
      </header>

      {gmailNotice ? (
        <p className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
          {gmailNotice}
        </p>
      ) : null}

      <section className="rounded-2xl border border-border bg-card/50 p-5 shadow-sm sm:p-6">
        <div className="mb-5 space-y-1">
          <h2 className="text-lg font-medium">New search</h2>
          <p className="text-sm text-muted-foreground">
            Prompt rules come from markdown files — edit them anytime.
          </p>
        </div>
        <LeadForm
          values={values}
          loading={loading}
          onChange={onValuesChange}
          onSubmit={onGenerate}
        />
        {error ? (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium">Results</h2>
            <p className="text-sm text-muted-foreground">
              {leads.length} lead{leads.length === 1 ? "" : "s"}
              {selectedIndexes.length > 0
                ? ` · ${selectedIndexes.length} selected`
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <UploadCsvButton onUpload={onUploadLeads} onError={onError} />
            <DownloadCsvButton leads={leads} />
            {leads.length > 0 ? (
              <Button type="button" onClick={onOpenOutreach}>
                <Mail />
                Open Email Outreach
              </Button>
            ) : null}
          </div>
        </div>

        <LeadsTable
          leads={leads}
          selectedIndexes={selectedIndexes}
          statusByIndex={statusByIndex}
          onToggle={onToggle}
          onToggleAll={onToggleAll}
        />
      </section>
    </div>
  );
}
