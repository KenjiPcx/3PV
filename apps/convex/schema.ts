import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  
  // Stream tasks tracking active Memories AI streams
  streamTasks: defineTable({
    taskId: v.string(),
    rtmpUrl: v.string(),
    systemPrompt: v.string(),
    userPrompt: v.string(),
    status: v.union(v.literal("active"), v.literal("stopped"), v.literal("error")),
    startedAt: v.number(),
    stoppedAt: v.optional(v.number()),
  }).index("by_taskId", ["taskId"]),
  
  // Stream events from Memories AI callbacks
  streamEvents: defineTable({
    taskId: v.string(),
    text: v.string(),
    timestamp: v.string(),
    status: v.number(),
    processed: v.boolean(), // Whether AI has processed this event for gamification
  })
    .index("by_taskId", ["taskId"])
    .index("by_processed", ["processed"]),
  
  // Gamification data
  gameStats: defineTable({
    userId: v.string(), // Clerk user ID
    hp: v.number(), // Health points
    exerciseCount: v.number(), // Total exercise count
    lastActivity: v.optional(v.number()),
  }).index("by_userId", ["userId"]),
  
  // AI coach messages
  coachMessages: defineTable({
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
    .index("by_userId", ["userId"])
    .index("by_timestamp", ["timestamp"]),
});
