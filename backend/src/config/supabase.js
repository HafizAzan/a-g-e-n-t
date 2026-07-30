/**
 * supabase.js — shared Supabase client (or null → memory repos).
 */
import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

/** @type {import("@supabase/supabase-js").SupabaseClient | null | undefined} */
let cachedClient;

export function getSupabaseClient() {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    logger.warn(
      "Supabase env missing. Repositories will use in-memory storage."
    );
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  logger.info("Supabase client ready.");
  return cachedClient;
}

export function isSupabaseEnabled() {
  return getSupabaseClient() !== null;
}
