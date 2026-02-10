import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import {
  getSilentOffers,
  getStalledOffers,
  getDailyActivity,
  getPipelineHealth
} from "../controllers/monitoring.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/silent-offers", getSilentOffers);
router.get("/stalled-offers", getStalledOffers);
router.get("/daily-activity", getDailyActivity);
router.get("/pipeline-health", getPipelineHealth);

export default router;