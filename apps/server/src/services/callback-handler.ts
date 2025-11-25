import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL = process.env.CONVEX_URL;
const CONVEX_DEPLOY_KEY = process.env.CONVEX_DEPLOY_KEY;

if (!CONVEX_URL) {
  console.warn("⚠️  CONVEX_URL not set. Callbacks will not be forwarded to Convex.");
}

interface MemoriesAICallback {
  status: number;
  task_id: string;
  data: {
    text: string;
    timestamp: string;
  };
}

/**
 * Process a callback from Memories AI and forward it to Convex
 */
export async function handleMemoriesAICallback(payload: MemoriesAICallback): Promise<void> {
  if (!CONVEX_URL) {
    console.warn("Skipping callback processing: CONVEX_URL not set");
    return;
  }

  try {
    // Create Convex client
    const client = new ConvexHttpClient(CONVEX_URL);
    
    if (CONVEX_DEPLOY_KEY) {
      // Use deploy key for server-side calls
      client.setAuth(CONVEX_DEPLOY_KEY);
    }

    // Forward to Convex mutation
    await client.mutation(api.streamEvents.processCallback, {
      taskId: payload.task_id,
      status: payload.status,
      text: payload.data.text,
      timestamp: payload.data.timestamp,
    });

    console.log(`✅ Processed callback for task ${payload.task_id}`);
  } catch (error: any) {
    console.error("Error forwarding callback to Convex:", error);
    throw error;
  }
}

