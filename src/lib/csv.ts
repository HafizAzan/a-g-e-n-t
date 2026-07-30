import type { Lead } from "@/types/lead";

const HEADERS: { key: keyof Lead; label: string }[] = [
  { key: "businessName", label: "Business Name" },
  { key: "category", label: "Category" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone Number" },
  { key: "website", label: "Website" },
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "googleMapsLink", label: "Google Maps Link" },
  { key: "aiNotes", label: "AI Notes" },
];

const HEADER_ALIASES: Record<string, keyof Lead> = {
  "business name": "businessName",
  businessname: "businessName",
  business: "businessName",
  name: "businessName",
  category: "category",
  city: "city",
  country: "country",
  email: "email",
  phone: "phone",
  "phone number": "phone",
  phonenumber: "phone",
  website: "website",
  facebook: "facebook",
  instagram: "instagram",
  linkedin: "linkedin",
  "google maps": "googleMapsLink",
  "google maps link": "googleMapsLink",
  googlemapslink: "googleMapsLink",
  maps: "googleMapsLink",
  "ai notes": "aiNotes",
  ainotes: "aiNotes",
  notes: "aiNotes",
};

function escapeCsvValue(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function leadsToCsv(leads: Lead[]): string {
  const headerRow = HEADERS.map((h) => escapeCsvValue(h.label)).join(",");
  const rows = leads.map((lead) =>
    HEADERS.map((h) => escapeCsvValue(lead[h.key] ?? "")).join(",")
  );
  return [headerRow, ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Simple CSV row parser that supports quoted commas and newlines. */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = "";
  };

  const pushRow = () => {
    // Ignore completely empty trailing rows
    if (row.length === 1 && row[0].trim() === "") {
      row = [];
      return;
    }
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      pushCell();
    } else if (char === "\n") {
      pushCell();
      pushRow();
    } else if (char === "\r") {
      // ignore CR; handle CRLF via the \n branch
    } else {
      cell += char;
    }
  }

  pushCell();
  if (row.length > 1 || (row.length === 1 && row[0].trim() !== "")) {
    pushRow();
  }

  return rows;
}

function emptyLead(): Lead {
  return {
    businessName: "",
    category: "",
    city: "",
    country: "",
    email: "",
    phone: "",
    website: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    googleMapsLink: "",
    aiNotes: "",
  };
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function parseCsvToLeads(csvText: string): Lead[] {
  const rows = parseCsvRows(csvText.replace(/^\uFEFF/, ""));

  if (rows.length < 2) {
    throw new Error("CSV must include a header row and at least one data row.");
  }

  const headerRow = rows[0].map(normalizeHeader);
  const columnMap: Array<keyof Lead | null> = headerRow.map((header) => {
    const compact = header.replace(/\s+/g, "");
    return (
      HEADER_ALIASES[header] ||
      HEADER_ALIASES[compact] ||
      null
    );
  });

  if (!columnMap.includes("businessName")) {
    throw new Error(
      'CSV must include a "Business Name" column (or "Name" / "Business").'
    );
  }

  const leads: Lead[] = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    const lead = emptyLead();

    columnMap.forEach((key, index) => {
      if (!key) return;
      const value = (values[index] || "").trim();
      if (key === "aiNotes" && lead.aiNotes && value) {
        lead.aiNotes = `${lead.aiNotes} ${value}`.trim();
        return;
      }
      lead[key] = value;
    });

    if (lead.businessName) {
      leads.push(lead);
    }
  }

  if (leads.length === 0) {
    throw new Error("No valid leads found in the CSV file.");
  }

  return leads;
}
