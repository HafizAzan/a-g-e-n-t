/**
 * app.js — Express application (ESM). All /api routes mounted.
 */
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";

import searchRoutes from "./routes/search.routes.js";
import leadsRoutes from "./routes/leads.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import exportRoutes from "./routes/export.routes.js";
import futureRoutes from "./routes/future.routes.js";

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    exposedHeaders: [
      "X-Export-Id",
      "X-Export-File-Url",
      "X-Export-Format",
      "Content-Disposition",
    ],
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      env: env.nodeEnv,
    },
  });
});

app.use("/api/search", searchRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/lead", leadRoutes);
app.use("/api/export", exportRoutes);
app.use("/api", futureRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
});

app.use(errorHandler);

export { app };
