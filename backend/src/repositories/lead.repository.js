/**
 * lead.repository.js — leads table CRUD (Supabase or memory).
 */
import { getSupabaseClient, isSupabaseEnabled } from "../config/supabase.js";
import { createId } from "../utils/helpers.js";
import { logger } from "../utils/logger.js";

/** @type {Map<string, object>} */
const leadsById = new Map();

/** @type {Map<string, string[]>} */
const leadIdsBySearch = new Map();

function toDbRow(lead) {
  return {
    id: lead.id,
    search_id: lead.searchId,
    business_name: lead.businessName || "",
    category: lead.category || "",
    phone: lead.phone || "",
    email: lead.email || "",
    website: lead.website || "",
    website_status: lead.websiteStatus || "unknown",
    lead_score: lead.leadScore ?? 0,
    address: lead.address || "",
    rating: lead.rating ?? 0,
    review_count: lead.reviewCount ?? 0,
    google_maps_url: lead.googleMapsUrl || "",
    ai_notes: lead.aiNotes || [],
  };
}

function fromDbRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    searchId: row.search_id,
    businessName: row.business_name,
    category: row.category,
    phone: row.phone,
    email: row.email,
    website: row.website,
    websiteStatus: row.website_status,
    leadScore: row.lead_score,
    address: row.address,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    googleMapsUrl: row.google_maps_url,
    aiNotes: row.ai_notes || [],
    createdAt: row.created_at,
  };
}

export async function saveLead(lead) {
  const id = lead.id || createId("lead");
  const saved = { ...lead, id };

  if (!isSupabaseEnabled()) {
    leadsById.set(id, saved);
    if (saved.searchId) {
      const list = leadIdsBySearch.get(saved.searchId) || [];
      if (!list.includes(id)) {
        list.push(id);
        leadIdsBySearch.set(saved.searchId, list);
      }
    }
    return saved;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .upsert(toDbRow(saved))
    .select()
    .single();

  if (error) {
    logger.error("lead.repository.saveLead failed", error.message);
    throw error;
  }

  return fromDbRow(data);
}

export async function findLeadById(id) {
  if (!isSupabaseEnabled()) {
    return leadsById.get(id) || null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logger.error("lead.repository.findLeadById failed", error.message);
    throw error;
  }

  return fromDbRow(data);
}

export async function findLeadsBySearchId(searchId) {
  if (!isSupabaseEnabled()) {
    const ids = leadIdsBySearch.get(searchId) || [];
    return ids.map((id) => leadsById.get(id)).filter(Boolean);
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("search_id", searchId)
    .order("lead_score", { ascending: false });

  if (error) {
    logger.error("lead.repository.findLeadsBySearchId failed", error.message);
    throw error;
  }

  return (data || []).map(fromDbRow);
}

export async function listLeads() {
  if (!isSupabaseEnabled()) {
    return [...leadsById.values()];
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("lead.repository.listLeads failed", error.message);
    throw error;
  }

  return (data || []).map(fromDbRow);
}

export async function deleteBySearchId(searchId) {
  if (!isSupabaseEnabled()) {
    const ids = leadIdsBySearch.get(searchId) || [];
    for (const id of ids) {
      leadsById.delete(id);
    }
    leadIdsBySearch.delete(searchId);
    return ids.length;
  }

  return 0;
}
