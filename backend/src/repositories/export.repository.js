/**
 * export.repository.js — exports table records.
 */
import { getSupabaseClient, isSupabaseEnabled } from "../config/supabase.js";
import { createId } from "../utils/helpers.js";
import { logger } from "../utils/logger.js";

/** @type {Map<string, object>} */
const byId = new Map();

/** @type {Map<string, string[]>} */
const idsBySearch = new Map();

function toDbRow(row) {
  return {
    id: row.id,
    search_id: row.searchId,
    file_url: row.fileUrl || "",
    created_at: row.createdAt,
  };
}

function fromDbRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    searchId: row.search_id,
    fileUrl: row.file_url,
    createdAt: row.created_at,
  };
}

export async function createExport({ id, searchId, fileUrl }) {
  const saved = {
    id: id || createId("export"),
    searchId,
    fileUrl: fileUrl || "",
    createdAt: new Date().toISOString(),
  };

  if (!isSupabaseEnabled()) {
    byId.set(saved.id, saved);
    const list = idsBySearch.get(searchId) || [];
    list.push(saved.id);
    idsBySearch.set(searchId, list);
    return saved;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("exports")
    .insert(toDbRow(saved))
    .select()
    .single();

  if (error) {
    logger.error("export.repository.createExport failed", error.message);
    throw error;
  }

  return fromDbRow(data);
}

export async function findBySearchId(searchId) {
  if (!isSupabaseEnabled()) {
    const ids = idsBySearch.get(searchId) || [];
    return ids.map((id) => byId.get(id)).filter(Boolean);
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("exports")
    .select("*")
    .eq("search_id", searchId)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("export.repository.findBySearchId failed", error.message);
    throw error;
  }

  return (data || []).map(fromDbRow);
}
