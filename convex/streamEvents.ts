import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Process a callback from Memories AI
 * This can be called internally from HTTP actions
 */
export const processCallback = internalMutation({
  args: {
    taskId: v.string(),
    status: v.number(),
    text: v.string(),
    timestamp: v.string(),
  },
  returns: v.id("streamEvents"),
  handler: async (ctx, args) => {
    console.log(`📥 [Convex] Processing callback for task ${args.taskId}`);
    console.log(`   Status: ${args.status}`);
    console.log(`   Text: "${args.text}"`);
    console.log(`   Timestamp: ${args.timestamp}`);

    // Store the event
    const eventId = await ctx.db.insert("streamEvents", {
      taskId: args.taskId,
      text: args.text,
      timestamp: args.timestamp,
      status: args.status,
      processed: false,
    });

    console.log(`✅ [Convex] Stored event with ID: ${eventId}`);

    // Update last callback time for health monitoring
    const task = await ctx.db
      .query("streamTasks")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .first();

    if (task && task.status === "active") {
      await ctx.db.patch(task._id, {
        lastCallbackTime: Date.now(),
      });
    }

    // Handle different status codes according to Memories AI API docs:
    // 0 = success (normal callback with analysis)
    // -1 = failure
    // 14 = stream ended (normal stop) - This can mean:
    //      - User manually stopped via /stop endpoint
    //      - RTMP source stream stopped (Memories AI detected and auto-stopped)
    //      - RTMP stream never started (Memories AI detected and auto-stopped)
    // 1001 = maximum concurrent streams reached
    // 2001 = credit deduction failed
    // 5000 = internal server error

    const isStreamEnded = args.status === 14; // Normal stream end
    const isError = args.status === -1 || args.status === 1001 || args.status === 2001 || args.status === 5000;
    const isEndOrError = isStreamEnded || isError;

    if (isEndOrError) {
      const statusLabel = isStreamEnded ? "ended" : "error";
      console.log(`🛑 [Convex] Stream ${statusLabel} (status ${args.status}), stopping task ${args.taskId}`);

      // Determine stop reason:
      // - If status 14: RTMP source stopped (Memories AI auto-detected)
      //   (We can't distinguish manual stop from RTMP stop just from status 14,
      //    but if we receive status 14 via callback, it's likely RTMP stopped)
      // - If error status: API error
      const stopReason = isStreamEnded
        ? "rtmp_stopped"  // RTMP source stopped or never started
        : "api_error";    // Memories AI error

      if (task && task.status === "active") {
        await ctx.db.patch(task._id, {
          status: isStreamEnded ? "stopped" : "error",
          stoppedAt: Date.now(),
          stopReason,
        });
        console.log(`✅ [Convex] Task ${args.taskId} marked as ${isStreamEnded ? "stopped" : "error"} (reason: ${stopReason})`);
      }
    } else if (args.status === 0) {
      // Status 0 = success, process for gamification
      // Process event for gamification (async, don't await)
      ctx.scheduler.runAfter(0, internal.streamEvents.processEventForGamification, {
        eventId,
      });
    } else {
      // Unknown status code - log but don't process
      console.warn(`⚠️ [Convex] Unknown status code ${args.status} for task ${args.taskId}`);
    }

    return eventId;
  },
});

/**
 * Process an event for gamification (detect exercises, update stats, etc.)
 */
export const processEventForGamification = internalMutation({
  args: {
    eventId: v.id("streamEvents"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event || event.processed) {
      return null;
    }

    const text = event.text.toLowerCase();

    // Simple keyword detection for exercises
    // In production, you'd use a more sophisticated AI model
    const exerciseKeywords = [
      "kick",
      "punch",
      "jump",
      "rep",
      "exercise",
      "workout",
      "squat",
      "push-up",
      "sit-up",
    ];

    const hasExercise = exerciseKeywords.some((keyword) => text.includes(keyword));

    if (hasExercise) {
      // Extract numbers from text (simple regex)
      const numbers = text.match(/\d+/g);
      const exerciseCount = numbers ? parseInt(numbers[0]) : 1;

      // Update game stats for the user
      // Note: In a real app, you'd get userId from the stream task or context
      // For now, we'll use a default or get from stream task
      const streamTask = await ctx.db
        .query("streamTasks")
        .withIndex("by_taskId", (q) => q.eq("taskId", event.taskId))
        .first();

      if (streamTask) {
        // Get or create game stats for user
        // For now, using a placeholder userId - you'll need to link this properly
        const userId = "default"; // TODO: Get from auth context or stream task

        let gameStats = await ctx.db
          .query("gameStats")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .first();

        if (!gameStats) {
          const statsId = await ctx.db.insert("gameStats", {
            userId,
            hp: 100,
            exerciseCount: 0,
          });
          gameStats = await ctx.db.get(statsId);
        }

        if (gameStats) {
          // Update exercise count
          await ctx.db.patch(gameStats._id, {
            exerciseCount: gameStats.exerciseCount + exerciseCount,
            hp: Math.min(100, gameStats.hp + exerciseCount * 2), // Increase HP
            lastActivity: Date.now(),
          });

          // Generate coach message
          await ctx.db.insert("coachMessages", {
            userId,
            message: `Great work! ${exerciseCount} more reps detected. Keep pushing! 💪`,
            type: "motivational",
            timestamp: Date.now(),
          });
        }
      }
    }

    // Mark event as processed
    await ctx.db.patch(args.eventId, {
      processed: true,
    });

    return null;
  },
});

/**
 * Query stream events for a task
 */
export const getEventsByTask = query({
  args: {
    taskId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("streamEvents"),
      _creationTime: v.number(),
      taskId: v.string(),
      text: v.string(),
      timestamp: v.string(),
      status: v.number(),
      processed: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const events = await ctx.db
      .query("streamEvents")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .take(limit);

    return events;
  },
});

/**
 * Query game stats for a user
 */
export const getGameStats = query({
  args: {
    userId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("gameStats"),
      userId: v.string(),
      hp: v.number(),
      exerciseCount: v.number(),
      lastActivity: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("gameStats")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    return stats ?? null;
  },
});

/**
 * Query recent coach messages
 */
export const getCoachMessages = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("coachMessages"),
      userId: v.string(),
      message: v.string(),
      type: v.union(
        v.literal("motivational"),
        v.literal("progress"),
        v.literal("warning"),
        v.literal("celebration")
      ),
      timestamp: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const messages = await ctx.db
      .query("coachMessages")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return messages;
  },
});

