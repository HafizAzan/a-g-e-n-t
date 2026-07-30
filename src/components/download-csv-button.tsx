"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv, leadsToCsv } from "@/lib/csv";
import type { Lead } from "@/types/lead";

type DownloadCsvButtonProps = {
  leads: Lead[];
};

export function DownloadCsvButton({ leads }: DownloadCsvButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={leads.length === 0}
      onClick={() => {
        const csv = leadsToCsv(leads);
        const stamp = new Date().toISOString().slice(0, 10);
        downloadCsv(`ai-lead-finder-${stamp}.csv`, csv);
      }}
    >
      <Download />
      Download CSV
    </Button>
  );
}
