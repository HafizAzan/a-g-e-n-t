"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { LeadsView } from "@/components/leads-view";
import { useAppState } from "@/providers/app-state";
import type { EmailSendStatus } from "@/types/outreach";

export function LeadsPageClient() {
  const router = useRouter();
  const {
    values,
    setValues,
    leads,
    selectedIndexes,
    drafts,
    loading,
    error,
    setError,
    gmailNotice,
    generateLeads,
    uploadLeads,
    toggleIndex,
    toggleAll,
  } = useAppState();

  const statusByIndex = useMemo(() => {
    const map: Record<number, EmailSendStatus> = {};
    for (const draft of drafts) {
      map[draft.leadIndex] = draft.status;
    }
    return map;
  }, [drafts]);

  return (
    <LeadsView
      values={values}
      leads={leads}
      selectedIndexes={selectedIndexes}
      statusByIndex={statusByIndex}
      loading={loading}
      error={error}
      gmailNotice={gmailNotice}
      onValuesChange={setValues}
      onGenerate={() => void generateLeads()}
      onToggle={toggleIndex}
      onToggleAll={toggleAll}
      onUploadLeads={uploadLeads}
      onError={setError}
      onOpenOutreach={() => router.push("/outreach")}
    />
  );
}
