import type { Lead } from "@/types/lead";

function asString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

/**
 * Fields required by src/prompts/08-output-format.md schema.
 * Extra fields on Lead stay optional and default to "".
 */
const REQUIRED_OUTPUT_FIELDS = [
  "businessName",
  "email",
  "phone",
  "website",
  "city",
  "country",
] as const;

function normalizeLead(raw: Record<string, unknown>): Lead {
  return {
    businessName: asString(
      raw.businessName ?? raw.business_name ?? raw.name
    ),
    category: asString(raw.category),
    city: asString(raw.city),
    country: asString(raw.country),
    email: asString(raw.email),
    phone: asString(raw.phone ?? raw.phoneNumber ?? raw.phone_number),
    website: asString(raw.website),
    facebook: asString(raw.facebook),
    instagram: asString(raw.instagram),
    linkedin: asString(raw.linkedin ?? raw.linkedIn),
    googleMapsLink: asString(
      raw.googleMapsLink ?? raw.google_maps_link ?? raw.mapsLink
    ),
    aiNotes: asString(raw.aiNotes ?? raw.ai_notes ?? raw.notes),
  };
}

function extractJsonText(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const arrayStart = trimmed.indexOf("[");
  const arrayEnd = trimmed.lastIndexOf("]");
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    return trimmed.slice(arrayStart, arrayEnd + 1);
  }

  const objectStart = trimmed.indexOf("{");
  const objectEnd = trimmed.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd > objectStart) {
    return trimmed.slice(objectStart, objectEnd + 1);
  }

  return trimmed;
}

function assertLeadShape(raw: Record<string, unknown>, index: number) {
  for (const field of REQUIRED_OUTPUT_FIELDS) {
    const aliases: Record<string, unknown[]> = {
      businessName: [raw.businessName, raw.business_name, raw.name],
      email: [raw.email],
      phone: [raw.phone, raw.phoneNumber, raw.phone_number],
      website: [raw.website],
      city: [raw.city],
      country: [raw.country],
    };

    const present = (aliases[field] || []).some(
      (value) => value !== undefined && value !== null
    );

    if (!present) {
      throw new Error(
        `AI response validation failed: lead at index ${index} is missing required field "${field}" (defined in output-format.md).`
      );
    }
  }
}

export function parseLeadsFromAiText(text: string): Lead[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(extractJsonText(text));
  } catch {
    throw new Error(
      "AI response validation failed: output-format.md requires JSON, but the response was not valid JSON."
    );
  }

  const list = Array.isArray(parsed)
    ? parsed
    : parsed &&
        typeof parsed === "object" &&
        Array.isArray((parsed as { leads?: unknown }).leads)
      ? (parsed as { leads: unknown[] }).leads
      : null;

  if (!list) {
    throw new Error(
      "AI response validation failed: expected a JSON array of leads, or an object with a \"leads\" array (see output-format.md)."
    );
  }

  if (list.length === 0) {
    throw new Error("AI response validation failed: leads array is empty.");
  }

  return list.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(
        `AI response validation failed: lead at index ${index} is not an object.`
      );
    }

    const raw = item as Record<string, unknown>;
    assertLeadShape(raw, index);

    const lead = normalizeLead(raw);

    if (!lead.businessName) {
      throw new Error(
        `AI response validation failed: lead at index ${index} has an empty businessName.`
      );
    }

    return lead;
  });
}
