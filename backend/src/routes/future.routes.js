/**
 * future.routes.js — 501 stubs
 */
import { Router } from "express";
import * as futureController from "../controllers/future.controller.js";

const router = Router();

router.post("/analyze/:leadId", futureController.analyzeLead);
router.post("/reanalyze", futureController.reanalyze);
router.post("/find-contacts", futureController.findContacts);

export default router;
