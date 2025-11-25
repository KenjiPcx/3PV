import express, { Router } from "express";
import { handleMemoriesAICallback } from "../services/callback-handler.js";

export const callbackRouter: Router = express.Router();

// Memories AI callback endpoint
callbackRouter.post("/memories-ai", async (req, res) => {
  try {
    // Acknowledge receipt immediately
    res.status(200).json({ received: true });

    // Process callback asynchronously
    handleMemoriesAICallback(req.body).catch((error) => {
      console.error("Error processing callback:", error);
    });
  } catch (error: any) {
    console.error("Error in callback endpoint:", error);
    // Still return 200 to prevent Memories AI from retrying
    res.status(200).json({ received: true, error: "Processing failed" });
  }
});

