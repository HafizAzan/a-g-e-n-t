/**
 * search.routes.js
 *
 * GET    /api/search
 * POST   /api/search
 * GET    /api/search/:id
 * GET    /api/search/:id/leads
 * DELETE /api/search/:id
 */
import { Router } from "express";
import * as searchController from "../controllers/search.controller.js";
import { validateSearchInput } from "../middleware/validateSearch.js";

const router = Router();

router.get("/", searchController.listSearches);
router.post("/", validateSearchInput, searchController.createSearch);
router.get("/:id/leads", searchController.listSearchLeads);
router.get("/:id", searchController.getSearch);
router.delete("/:id", searchController.deleteSearch);

export default router;
