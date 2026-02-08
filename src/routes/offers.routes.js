import express from "express";
import { createOffer } from "../controllers/offers.controller.js";


const router = express.Router();

router.post("/", createOffer);

export default router;
