/**
 * search.repository.js — searches table CRUD (Supabase or memory).
 */
import { getSupabaseClient, isSupabaseEnabled } from "../config/supabase.js";
import { createId } from "../utils/helpers.js";
import { logger } from "../utils/logger.js";

/** @type {Map<string, object>} */
const memorySearches = new Map();

/** @type {Map<string, object>} */
const memoryRuntime = new Map();

function toDbRow(search) {
  return {
    id: search.id,
    query: search.query || "",
    city: search.city || "",
    country: search.country || "",
    status: search.status || "queued",
    total_found: search.totalFound ?? 0,
    created_at: search.createdAt,
  };
}

function fromDbRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    query: row.query,
    city: row.city,
    country: row.country,
    status: row.status,
    totalFound: row.total_found,
    createdAt: row.created_at,
  };
}

export async function createSearch(partial = {}) {
  const search = {
    id: partial.id || createId("search"),
    query: partial.query || "",
    city: partial.city || "",
    country: partial.country || "",
    status: partial.status || "queued",
    totalFound: partial.totalFound ?? 0,
    createdAt: partial.createdAt || new Date().toISOString(),
  };

  if (partial.criteria) {
    memoryRuntime.set(search.id, { criteria: partial.criteria });
  }

  if (!isSupabaseEnabled()) {
    memorySearches.set(search.id, search);
    return { ...search, criteria: partial.criteria || {} };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("searches")
    .insert(toDbRow(search))
    .select()
    .single();

  if (error) {
    logger.error("search.repository.createSearch failed", error.message);
    throw error;
  }

  return { ...fromDbRow(data), criteria: partial.criteria || {} };
}

export async function updateSearch(id, patch) {
  if (!isSupabaseEnabled()) {
    const current = memorySearches.get(id);
    if (!current) return null;
    const next = { ...current, ...patch };
    memorySearches.set(id, next);
    return next;
  }

  const dbPatch = {};
  if (patch.query !== undefined) dbPatch.query = patch.query;
  if (patch.city !== undefined) dbPatch.city = patch.city;
  if (patch.country !== undefined) dbPatch.country = patch.country;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.totalFound !== undefined) dbPatch.total_found = patch.totalFound;

  if (Object.keys(dbPatch).length === 0) {
    return findSearchById(id);
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("searches")
    .update(dbPatch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    logger.error("search.repository.updateSearch failed", error.message);
    throw error;
  }

  return fromDbRow(data);
}

export async function findSearchById(id) {
  const runtime = memoryRuntime.get(id) || {};

  if (!isSupabaseEnabled()) {
    const search = memorySearches.get(id);
    if (!search) return null;
    return { ...search, ...runtime };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("searches")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logger.error("search.repository.findSearchById failed", error.message);
    throw error;
  }

  const search = fromDbRow(data);
  if (!search) return null;
  return { ...search, ...runtime };
}

export async function listSearches() {
  if (!isSupabaseEnabled()) {
    return [...memorySearches.values()].sort((a, b) =>
      String(b.createdAt).localeCompare(String(a.createdAt))
    );
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("searches")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("search.repository.listSearches failed", error.message);
    throw error;
  }

  return (data || []).map(fromDbRow);
}

export async function deleteSearch(id) {
  memoryRuntime.delete(id);

  if (!isSupabaseEnabled()) {
    return memorySearches.delete(id);
  }

  const supabase = getSupabaseClient();
  const { error, count } = await supabase
    .from("searches")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    logger.error("search.repository.deleteSearch failed", error.message);
    throw error;
  }

  return (count ?? 0) > 0;
}
