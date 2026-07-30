"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseCsvToLeads } from "@/lib/csv";
import type { Lead } from "@/types/lead";

type UploadCsvButtonProps = {
  onUpload: (leads: Lead[]) => void;
  onError: (message: string) => void;
};

export function UploadCsvButton({ onUpload, onError }: UploadCsvButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      onError("Please upload a .csv file.");
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const leads = parseCsvToLeads(text);
      onUpload(leads);
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Failed to parse CSV file."
      );
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
        }}
      />
      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload />
        {loading ? "Uploading..." : "Upload CSV"}
      </Button>
    </>
  );
}
