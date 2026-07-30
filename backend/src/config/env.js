/**
 * env.js
 * Purpose: load .env once and expose typed config.
 * Always import env from here — never scatter process.env in features.
 */
import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,

  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
  cursorApiKey: process.env.CURSOR_API_KEY || "",

  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};
