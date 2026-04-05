import express from "express";
import { razorpayWebhookHandler } from "../controllers/webhookController.js";

const router = express.Router();

router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhookHandler
);

export default router;
