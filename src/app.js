import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import clientsRouter from "./routes/clients.routes.js";
import offersRouter from "./routes/offers.routes.js";
import followUpsRouter from "./routes/followups.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import authRoutes from "./routes/auth.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import monitoringRoutes from "./routes/monitoring.routes.js";

console.log("🔥 REAL APP.JS LOADED:", import.meta.url);

const app = express();

/**
 * ======================
 * GLOBAL SECURITY
 * ======================
 */

// Security headers
app.use(helmet());

// Rate limiting (GLOBAL)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(apiLimiter);

// CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://domain-frontend-kamu.com"
  ],
  credentials: true
}));

// JSON parser
app.use(express.json());

/**
 * ======================
 * DEV LOGGER
 * ======================
 */
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(
      "🌐 INCOMING:",
      req.method,
      req.originalUrl,
      "CT:",
      req.headers["content-type"] || "-"
    );
    next();
  });
}

/**
 * ======================
 * ROUTES
 * ======================
 */

app.use("/auth", authRoutes);
app.use("/clients", clientsRouter);
app.use("/offers", offersRouter);
app.use("/offers", followUpsRouter); // nested: /offers/:id/follow-ups
app.use("/analytics", analyticsRouter);
app.use("/audit-logs", auditRoutes);
app.use("/monitoring", monitoringRoutes);
// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


/**
 * ======================
 * ERROR HANDLER
 * ======================
 */
// MUST BE LAST
app.use(errorHandler);

export default app;
