/**
 * export.api.ts
 * Purpose: download CSV / Excel / JSON from /api/export/*
 */
import { api } from "@/api/axios";

export type ExportFormat = "csv" | "excel" | "json";

export type ExportLeadsOptions = {
  searchId: string;
  ids?: string[];
  includePhone?: boolean;
  includeEmail?: boolean;
  includeWebsite?: boolean;
  includeLeadScore?: boolean;
  includeReviews?: boolean;
};

export type ExportFileResult = {
  blob: Blob;
  filename: string;
  exportId?: string;
  fileUrl?: string;
  format?: string;
};

/**
 * POST /api/export/:format — returns a downloadable file blob.
 */
export async function exportLeads(
  format: ExportFormat,
  options: ExportLeadsOptions
): Promise<ExportFileResult> {
  const response = await api.post(`/api/export/${format}`, options, {
    responseType: "blob",
  });

  const disposition = String(response.headers["content-disposition"] || "");
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const filename =
    match?.[1] ||
    `leads-export.${format === "excel" ? "xlsx" : format}`;

  return {
    blob: response.data as Blob,
    filename,
    exportId: response.headers["x-export-id"],
    fileUrl: response.headers["x-export-file-url"],
    format: response.headers["x-export-format"] || format,
  };
}

/** Helper: trigger a browser download from an export result */
export function downloadExportFile(file: ExportFileResult) {
  const url = URL.createObjectURL(file.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
