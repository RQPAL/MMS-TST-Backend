import express from "express";
import {
  createFollowUp,
  getFollowUpsByOffer,
  getOverdueFollowUps
} from "../controllers/followups.controller.js";

import { validateRequest } from "../utils/validate.js";
import { createFollowUpSchema } from "../schemas/followup.schema.js";
import { authenticate } from "../middlewares/authenticate.js"; 

const router = express.Router();

/**
 * CREATE FOLLOW UP
 * POST /follow-ups
 */
router.post(
  "/",
  validateRequest(createFollowUpSchema),
  authenticate,
  createFollowUp
);

/**
 * GET FOLLOW UPS BY OFFER
 * GET /offers/:id/follow-ups
 * (atau /follow-ups/offers/:id/follow-ups tergantung mount)
 */
router.get(
  "/:id/follow-ups",
  authenticate,
  getFollowUpsByOffer
);

/**
 * GET OVERDUE FOLLOW UPS
 * GET /follow-ups/overdue
 */
router.get(
  "/overdue",
  authenticate,
  getOverdueFollowUps
);

export default router;
