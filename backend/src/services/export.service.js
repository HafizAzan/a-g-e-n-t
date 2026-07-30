/**
 * export.service.js — CSV / Excel / JSON builders + exports row.
 * (SheetJS for .xlsx; file_url is stub until storage is added.)
 */
import XLSX from "xlsx";
import { rowsToCsv } from "../utils/csv.js";
import * as exportRepository from "../repositories/export.repository.js";
import { createId } from "../utils/helpers.js";

const FORMATS = {
  csv: { ext: "csv", contentType: "text/csv; charset=utf-8" },
  excel: {
    ext: "xlsx",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  json: { ext: "json", contentType: "application/json; charset=utf-8" },
};

export function normalizeFormat(raw) {
  const value = String(raw || "csv").trim().toLowerCase();
  if (value === "xlsx" || value === "xls" || value === "excel") return "excel";
  if (value === "json") return "json";
  return "csv";
}

export function buildExportRows(leads, options = {}) {
  const {
    includePhone = true,
    includeEmail = true,
    includeWebsite = true,
    includeLeadScore = true,
    includeReviews = false,
    includeAddress = true,
    includeCategory = true,
  } = options;

  return (leads || []).map((lead) => {
    /** @type {Record<string, string|number>} */
    const row = { business_name: lead.businessName || "" };
    if (includeCategory) row.category = lead.category || "";
    if (includeAddress) row.address = lead.address || "";
    if (includePhone) row.phone = lead.phone || "";
    if (includeEmail) row.email = lead.email || "";
    if (includeWebsite) row.website = lead.website || "";
    if (includeLeadScore) row.lead_score = lead.leadScore ?? "";
    if (includeReviews) {
      row.rating = lead.rating ?? "";
      row.review_count = lead.reviewCount ?? "";
    }
    return row;
  });
}

export function toCsv(rows) {
  return rowsToCsv(rows);
}

export function toExcel(rows) {
  const sheetRows = rows.length ? rows : [{ business_name: "" }];
  const worksheet = XLSX.utils.json_to_sheet(sheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export function toJson(rows) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      count: rows.length,
      leads: rows,
    },
    null,
    2
  );
}

function encodeRows(rows, format) {
  if (format === "excel") return toExcel(rows);
  if (format === "json") return toJson(rows);
  return toCsv(rows);
}

export async function buildAndRecordExport(searchId, leads, options = {}) {
  const format = normalizeFormat(options.format);
  const meta = FORMATS[format];
  const rows = buildExportRows(leads, options);

  const exportId = createId("export");
  const filename = `leads-export-${exportId}.${meta.ext}`;
  const body = encodeRows(rows, format);
  const fileUrl = `stub://exports/${searchId}/${filename}`;

  const record = await exportRepository.createExport({
    id: exportId,
    searchId,
    fileUrl,
  });

  return {
    export: record,
    format,
    filename,
    contentType: meta.contentType,
    body,
    fileUrl: record.fileUrl,
    rowCount: rows.length,
  };
}
