import express from "express";
import { createOffer, getOffers } from "../controllers/offers.controller.js";
import { validateRequest } from "../utils/validate.js";
import { createOfferSchema } from "../schemas/offer.schema.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.post(
  "/",
  validateRequest(createOfferSchema),
  authenticate,
  createOffer
);
router.get("/", authenticate, getOffers); // ⬅️ INI WAJIB ADA

export default router;
