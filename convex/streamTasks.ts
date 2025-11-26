import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new stream task
 */
export const createTask = mutation({
  args: {
    taskId: v.string(),
    rtmpUrl: v.string(),
    systemPrompt: v.string(),
    userPrompt: v.string(),
  },
  returns: v.id("streamTasks"),
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("streamTasks", {
      taskId: args.taskId,
      rtmpUrl: args.rtmpUrl,
      systemPrompt: args.systemPrompt,
      userPrompt: args.userPrompt,
      status: "active",
      startedAt: Date.now(),
    });

    return taskId;
  },
});

/**
 * Stop a stream task
 */
export const stopTask = mutation({
  args: {
    taskId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const task = await ctx.db
      .query("streamTasks")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .first();

    if (task) {
      await ctx.db.patch(task._id, {
        status: "stopped",
        stoppedAt: Date.now(),
        stopReason: "manual", // User manually stopped via UI
      });
    }

    return null;
  },
});

/**
 * Get active stream tasks
 */
export const getActiveTasks = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("streamTasks"),
      _creationTime: v.number(), // Convex automatically adds this field
      taskId: v.string(),
      rtmpUrl: v.string(),
      systemPrompt: v.string(),
      userPrompt: v.string(),
      status: v.union(v.literal("active"), v.literal("stopped"), v.literal("error")),
      startedAt: v.number(),
      stoppedAt: v.optional(v.number()),
      stopReason: v.optional(v.union(
        v.literal("manual"),
        v.literal("rtmp_stopped"),
        v.literal("api_error"),
        v.literal("unknown")
      )),
      lastCallbackTime: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    const tasks = await ctx.db.query("streamTasks").collect();
    return tasks.filter((task) => task.status === "active");
  },
});

/**
 * Get a task by taskId
 */
export const getTaskById = query({
  args: {
    taskId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("streamTasks"),
      _creationTime: v.number(), // Convex automatically adds this field
      taskId: v.string(),
      rtmpUrl: v.string(),
      systemPrompt: v.string(),
      userPrompt: v.string(),
      status: v.union(v.literal("active"), v.literal("stopped"), v.literal("error")),
      startedAt: v.number(),
      stoppedAt: v.optional(v.number()),
      stopReason: v.optional(v.union(
        v.literal("manual"),
        v.literal("rtmp_stopped"),
        v.literal("api_error"),
        v.literal("unknown")
      )),
      lastCallbackTime: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const task = await ctx.db
      .query("streamTasks")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .first();

    return task ?? null;
  },
});

