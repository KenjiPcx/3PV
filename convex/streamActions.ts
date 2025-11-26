"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { startMemoriesAIStream, stopMemoriesAIStream } from "./memoriesAI";

/**
 * Start a stream analysis with Memories AI and create a task in Convex
 */
export const startStreamAnalysis = action({
  args: {
    rtmpUrl: v.string(),
    systemPrompt: v.string(),
    userPrompt: v.string(),
    thinking: v.optional(v.boolean()),
  },
  returns: v.object({
    taskId: v.string(),
  }),
  handler: async (ctx, args) => {
    // Get the Convex deployment URL for the callback
    // First try environment variable (should be set in Convex Dashboard)
    let convexUrl = process.env.CONVEX_URL;

    if (!convexUrl) {
      // Fallback: try to get from a query (but this requires a query call)
      // Actually, we can't call queries from actions easily, so we'll throw a helpful error
      throw new Error(
        "CONVEX_URL environment variable not set.\n" +
        "Please set it in Convex Dashboard → Settings → Environment Variables:\n" +
        "CONVEX_URL=https://your-deployment.convex.cloud\n" +
        "(Use the same URL as VITE_CONVEX_URL in your .env.local file)"
      );
    }

    // Ensure URL doesn't have trailing slash
    convexUrl = convexUrl.replace(/\/$/, "");

    // Construct callback URL - Convex HTTP actions are available at /callback/memories-ai
    const callbackUrl = `${convexUrl}/callback/memories-ai`;

    console.log(`✅ Callback URL: ${callbackUrl}`);
    console.log(`   (Using CONVEX_URL from environment: ${convexUrl})`);

    // Start the stream with Memories AI (using helper function directly)
    const result = await startMemoriesAIStream({
      rtmpUrl: args.rtmpUrl,
      systemPrompt: args.systemPrompt,
      userPrompt: args.userPrompt,
      callbackUrl,
      thinking: args.thinking,
    });

    // Create task in Convex
    await ctx.runMutation(api.streamTasks.createTask, {
      taskId: result.taskId,
      rtmpUrl: args.rtmpUrl,
      systemPrompt: args.systemPrompt,
      userPrompt: args.userPrompt,
    });

    console.log(`✅ Created Convex task for ${result.taskId}`);

    return { taskId: result.taskId };
  },
});

/**
 * Stop a stream analysis with Memories AI and update the task in Convex
 */
export const stopStreamAnalysis = action({
  args: {
    taskId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Stop the stream with Memories AI (using helper function directly)
    await stopMemoriesAIStream(args.taskId);

    // Update task in Convex
    await ctx.runMutation(api.streamTasks.stopTask, {
      taskId: args.taskId,
    });

    console.log(`✅ Stopped Convex task for ${args.taskId}`);

    return null;
  },
});

