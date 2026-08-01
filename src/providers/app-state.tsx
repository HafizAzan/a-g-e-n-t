"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LeadFormValues } from "@/components/lead-form";
import type { Lead } from "@/types/lead";
import type { AttachmentPayload, EmailTemplate, OutreachDraft } from "@/types/outreach";

const INITIAL_VALUES: LeadFormValues = {
  prompt: "Find gyms in New York that may need a new website.",
  country: "United States",
  city: "New York",
  limit: 10,
};

type AppStateContextValue = {
  values: LeadFormValues;
  setValues: (values: LeadFormValues) => void;
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  selectedIndexes: number[];
  setSelectedIndexes: (indexes: number[]) => void;
  drafts: OutreachDraft[];
  setDrafts: (drafts: OutreachDraft[]) => void;
  attachments: AttachmentPayload[];
  setAttachments: (files: AttachmentPayload[]) => void;
  outreachTemplate: EmailTemplate | null;
  setOutreachTemplate: (template: EmailTemplate | null) => void;
  senderName: string;
  setSenderName: (name: string) => void;
  loading: boolean;
  error: string | null;
  setError: (message: string | null) => void;
  gmailNotice: string | null;
  generateLeads: () => Promise<void>;
  uploadLeads: (leads: Lead[]) => void;
  toggleIndex: (index: number) => void;
  toggleAll: () => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<LeadFormValues>(INITIAL_VALUES);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [drafts, setDrafts] = useState<OutreachDraft[]>([]);
  const [attachments, setAttachments] = useState<AttachmentPayload[]>([]);
  const [outreachTemplate, setOutreachTemplate] = useState<EmailTemplate | null>(null);
  const [senderName, setSenderName] = useState("Your Name");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gmailNotice, setGmailNotice] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gmail = params.get("gmail");
    if (gmail === "connected") {
      setGmailNotice("Gmail connected successfully.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (gmail === "error") {
      setGmailNotice(
        `Gmail connection failed: ${params.get("message") || "unknown error"}`
      );
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const generateLeads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as {
        leads?: Lead[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate leads.");
      }

      setLeads(data.leads ?? []);
      setSelectedIndexes([]);
      setDrafts([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [values]);

  const uploadLeads = useCallback((nextLeads: Lead[]) => {
    setLeads(nextLeads);
    setSelectedIndexes([]);
    setDrafts([]);
    setError(null);
  }, []);

  const toggleIndex = useCallback((index: number) => {
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIndexes((prev) =>
      prev.length === leads.length ? [] : leads.map((_, index) => index)
    );
  }, [leads.length]);

  const value = useMemo(
    () => ({
      values,
      setValues,
      leads,
      setLeads,
      selectedIndexes,
      setSelectedIndexes,
      drafts,
      setDrafts,
      attachments,
      setAttachments,
      outreachTemplate,
      setOutreachTemplate,
      senderName,
      setSenderName,
      loading,
      error,
      setError,
      gmailNotice,
      generateLeads,
      uploadLeads,
      toggleIndex,
      toggleAll,
    }),
    [
      values,
      leads,
      selectedIndexes,
      drafts,
      attachments,
      outreachTemplate,
      senderName,
      loading,
      error,
      gmailNotice,
      generateLeads,
      uploadLeads,
      toggleIndex,
      toggleAll,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used inside AppStateProvider.");
  }
  return ctx;
}
