/**
 * server.js — HTTP entry. Loads env via config/env.js (dotenv).
 */
import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

app.listen(env.port, () => {
  logger.info(`Lead Finder API listening on http://localhost:${env.port}`);
  logger.info(`Health check: http://localhost:${env.port}/health`);
});
