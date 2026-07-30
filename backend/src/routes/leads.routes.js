/**
 * leads.routes.js — GET /api/leads
 */
import { Router } from "express";
import * as leadsController from "../controllers/leads.controller.js";

const router = Router();

router.get("/", leadsController.listLeads);

export default router;
