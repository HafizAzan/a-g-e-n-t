/**
 * lead.routes.js — GET /api/lead/:id
 */
import { Router } from "express";
import * as leadsController from "../controllers/leads.controller.js";

const router = Router();

router.get("/:id", leadsController.getLead);

export default router;
