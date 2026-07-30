/**
 * search.controller.js
 */
import * as searchService from "../services/search.service.js";
import * as leadsService from "../services/leads.service.js";
import { notFound } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const createSearch = asyncHandler(async (req, res) => {
  const data = await searchService.startSearch(req.body || {});
  res.status(201).json({ success: true, data });
});

export const listSearches = asyncHandler(async (req, res) => {
  const data = await searchService.listSearches();
  res.json({ success: true, data });
});

export const getSearch = asyncHandler(async (req, res) => {
  const data = await searchService.getSearchStatus(req.params.id);
  if (!data) throw notFound("Search not found");
  res.json({ success: true, data });
});

export const listSearchLeads = asyncHandler(async (req, res) => {
  const data = await leadsService.listBySearchId(req.params.id);
  res.json({ success: true, data });
});

export const deleteSearch = asyncHandler(async (req, res) => {
  const data = await searchService.deleteSearch(req.params.id);
  if (!data) throw notFound("Search not found");
  res.json({ success: true, data });
});
