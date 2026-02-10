import express from "express";
import { createClient, getClients, updateClient } from "../controllers/clients.controller.js";
import { validateRequest } from "../utils/validate.js";
import { createClientSchema } from "../schemas/client.schema.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.post(
  "/",
  validateRequest(createClientSchema),
  authenticate,
  createClient
);

router.get("/", authenticate, getClients);
router.put("/:id", authenticate, updateClient);

export default router;
