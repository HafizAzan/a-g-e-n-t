/**
 * export.routes.js
 * POST /api/export/csv|excel|json
 */
import { Router } from "express";
import * as leadsController from "../controllers/leads.controller.js";

const router = Router();

function withFormat(format) {
  return (req, res, next) => {
    req.params.format = format;
    return leadsController.exportLeads(req, res, next);
  };
}

router.post("/csv", withFormat("csv"));
router.post("/excel", withFormat("excel"));
router.post("/xlsx", withFormat("excel"));
router.post("/json", withFormat("json"));

export default router;
