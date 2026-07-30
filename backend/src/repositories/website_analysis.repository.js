/**
 * website_analysis.repository.js — ESM (unused until website step).
 */
import { getSupabaseClient, isSupabaseEnabled } from "../config/supabase.js";
import { createId } from "../utils/helpers.js";
import { logger } from "../utils/logger.js";

/** @type {Map<string, object>} */
const byLeadId = new Map();

function toDbRow(row) {
  return {
    id: row.id,
    lead_id: row.leadId,
    mobile_friendly: Boolean(row.mobileFriendly),
    https: Boolean(row.https),
    seo_score: row.seoScore ?? 0,
    speed_score: row.speedScore ?? 0,
    technology: row.technology || [],
    has_booking: Boolean(row.hasBooking),
    has_contact_form: Boolean(row.hasContactForm),
    social_links: row.socialLinks || [],
    last_checked: row.lastChecked || new Date().toISOString(),
  };
}

function fromDbRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    leadId: row.lead_id,
    mobileFriendly: row.mobile_friendly,
    https: row.https,
    seoScore: row.seo_score,
    speedScore: row.speed_score,
    technology: row.technology || [],
    hasBooking: row.has_booking,
    hasContactForm: row.has_contact_form,
    socialLinks: row.social_links || [],
    lastChecked: row.last_checked,
  };
}

export async function saveForLead(leadId, analysis) {
  const saved = {
    id: analysis.id || createId("wa"),
    leadId,
    mobileFriendly: analysis.mobileFriendly ?? false,
    https: analysis.https ?? false,
    seoScore: analysis.seoScore ?? 0,
    speedScore: analysis.speedScore ?? 0,
    technology: analysis.technology || [],
    hasBooking: analysis.hasBooking ?? false,
    hasContactForm: analysis.hasContactForm ?? false,
    socialLinks: analysis.socialLinks || [],
    lastChecked: analysis.lastChecked || new Date().toISOString(),
  };

  if (!isSupabaseEnabled()) {
    byLeadId.set(leadId, saved);
    return saved;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("website_analysis")
    .upsert(toDbRow(saved), { onConflict: "lead_id" })
    .select()
    .single();

  if (error) {
    logger.error("website_analysis.repository.saveForLead failed", error.message);
    throw error;
  }

  return fromDbRow(data);
}

export async function findByLeadId(leadId) {
  if (!isSupabaseEnabled()) {
    return byLeadId.get(leadId) || null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("website_analysis")
    .select("*")
    .eq("lead_id", leadId)
    .maybeSingle();

  if (error) {
    logger.error("website_analysis.repository.findByLeadId failed", error.message);
    throw error;
  }

  return fromDbRow(data);
}
