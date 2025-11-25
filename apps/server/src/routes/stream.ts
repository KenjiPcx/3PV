import express, { Router } from "express";
import { startStream, stopStream } from "../services/memories-ai.js";
import { createConvexTask, stopConvexTask } from "../services/convex-integration.js";

export const streamRouter: Router = express.Router();

const MEMORIES_AI_BASE_URL = "https://stream.memories.ai";

interface StartStreamRequest {
  rtmpUrl: string;
  systemPrompt: string;
  userPrompt: string;
  thinking?: boolean;
}

// Start a new stream analysis
streamRouter.post("/start", async (req, res) => {
  try {
    const { rtmpUrl, systemPrompt, userPrompt, thinking = false } = req.body as StartStreamRequest;

    if (!rtmpUrl || !systemPrompt || !userPrompt) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["rtmpUrl", "systemPrompt", "userPrompt"],
      });
    }

    const callbackUrl = `${process.env.CALLBACK_BASE_URL || `http://localhost:${process.env.PORT || 3001}`}/api/callback/memories-ai`;

    const result = await startStream({
      url: rtmpUrl,
      systemPrompt,
      userPrompt,
      callback: callbackUrl,
      thinking,
    });

    // Create task in Convex
    await createConvexTask({
      taskId: result.task_id,
      rtmpUrl,
      systemPrompt,
      userPrompt,
    });

    res.json({
      success: true,
      taskId: result.task_id,
      message: "Stream analysis started",
    });
  } catch (error: any) {
    console.error("Error starting stream:", error);
    res.status(500).json({
      error: "Failed to start stream",
      message: error.response?.data?.message || error.message,
    });
  }
});

// Stop an active stream
streamRouter.post("/stop/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    const result = await stopStream(taskId);

    // Update task in Convex
    await stopConvexTask(taskId);

    res.json({
      success: true,
      taskId: result.task_id,
      message: "Stream analysis stopped",
    });
  } catch (error: any) {
    console.error("Error stopping stream:", error);
    res.status(500).json({
      error: "Failed to stop stream",
      message: error.response?.data?.message || error.message,
    });
  }
});

