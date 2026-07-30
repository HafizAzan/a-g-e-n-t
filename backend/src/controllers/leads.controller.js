/**
 * leads.controller.js — list/detail + export download.
 */
import * as leadsService from "../services/leads.service.js";
import { badRequest, notFound } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const listLeads = asyncHandler(async (req, res) => {
  const data = await leadsService.listAll();
  res.json({ success: true, data });
});

export const getLead = asyncHandler(async (req, res) => {
  const data = await leadsService.getById(req.params.id);
  if (!data) throw notFound("Lead not found");
  res.json({ success: true, data });
});

export const exportLeads = asyncHandler(async (req, res) => {
  const searchId = req.body?.searchId || req.query.searchId;
  if (!searchId) throw badRequest("searchId is required");

  const ids = Array.isArray(req.body?.ids)
    ? req.body.ids
    : typeof req.query.ids === "string" && req.query.ids.length > 0
      ? req.query.ids.split(",").map((id) => id.trim())
      : [];

  const format =
    req.params.format || req.body?.format || req.query.format || "csv";

  const file = await leadsService.exportBySearchId(searchId, {
    ids,
    format,
    columns: req.body || {},
  });

  res.setHeader("Content-Type", file.contentType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${file.filename}"`
  );
  res.setHeader("X-Export-Id", file.export.id);
  res.setHeader("X-Export-File-Url", file.fileUrl);
  res.setHeader("X-Export-Format", file.format);
  res.send(file.body);
});
