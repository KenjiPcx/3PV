import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Callback endpoint for Memories AI
http.route({
  path: "/callback/memories-ai",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.json();
    
    console.log("📥 [Callback] Received Memories AI callback:");
    console.log(JSON.stringify(payload, null, 2));
    
    if (payload.data?.text) {
      console.log(`📝 [Callback] Transcription: "${payload.data.text}"`);
      console.log(`⏰ [Callback] Timestamp: ${payload.data.timestamp}`);
    }
    
    // Process the callback via internal mutation
    await ctx.runMutation(internal.streamEvents.processCallback, {
      taskId: payload.task_id,
      status: payload.status,
      text: payload.data?.text || "",
      timestamp: payload.data?.timestamp || new Date().toISOString(),
    });
    
    console.log(`✅ [Callback] Processed callback for task ${payload.task_id}`);
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;

