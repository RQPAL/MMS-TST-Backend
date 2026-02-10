import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { getAuditLogs } from "../controllers/audit.controller.js";

const router = express.Router();

// READ ONLY
router.get("/", authenticate, getAuditLogs);

export default router;
