import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Process a callback from Memories AI via Express server
 * This mutation is called by the Express server when it receives a callback
 */
export const processCallback = mutation({
  args: {
    taskId: v.string(),
    status: v.number(),
    text: v.string(),
    timestamp: v.string(),
  },
  returns: v.id("streamEvents"),
  handler: async (ctx, args) => {
    // Store the event
    const eventId = await ctx.db.insert("streamEvents", {
      taskId: args.taskId,
      text: args.text,
      timestamp: args.timestamp,
      status: args.status,
      processed: false,
    });

    // Process event for gamification (async, don't await)
    ctx.scheduler.runAfter(0, internal.streamEvents.processEventForGamification, {
      eventId,
    });

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

