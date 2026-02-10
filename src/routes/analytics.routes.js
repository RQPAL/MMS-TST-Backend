import express from "express";
import {
  getSummaryAnalytics,
  getChannelAnalytics,
  getFuDistributionAnalytics,
  getIndustryAnalytics
} from "../controllers/analytics.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.use((req, res, next) => {
  console.log(">>> ANALYTICS ROUTE HIT:", req.method, req.url);
  next();
});

router.get("/summary", authenticate, getSummaryAnalytics);
router.get("/channel", authenticate, getChannelAnalytics);
router.get("/fu-distribution", authenticate, getFuDistributionAnalytics);
router.get("/industry", authenticate, getIndustryAnalytics);

export default router;
