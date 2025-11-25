import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const CONVEX_URL = process.env.CONVEX_URL;
const CONVEX_DEPLOY_KEY = process.env.CONVEX_DEPLOY_KEY;

if (!CONVEX_URL) {
  console.warn("⚠️  CONVEX_URL not set. Convex integration will not work.");
}

let client: ConvexHttpClient | null = null;

function getClient(): ConvexHttpClient {
  if (!CONVEX_URL) {
    throw new Error("CONVEX_URL environment variable is not set");
  }

  if (!client) {
    client = new ConvexHttpClient(CONVEX_URL);
    if (CONVEX_DEPLOY_KEY) {
      client.setAuth(CONVEX_DEPLOY_KEY);
    }
  }

  return client;
}

interface CreateTaskParams {
  taskId: string;
  rtmpUrl: string;
  systemPrompt: string;
  userPrompt: string;
}

export async function createConvexTask(params: CreateTaskParams): Promise<void> {
  if (!CONVEX_URL) {
    console.warn("Skipping Convex task creation: CONVEX_URL not set");
    return;
  }

  try {
    const convexClient = getClient();
    await convexClient.mutation(api.streamTasks.createTask, params);
    console.log(`✅ Created Convex task for ${params.taskId}`);
  } catch (error: any) {
    console.error("Error creating Convex task:", error);
    throw error;
  }
}

export async function stopConvexTask(taskId: string): Promise<void> {
  if (!CONVEX_URL) {
    console.warn("Skipping Convex task stop: CONVEX_URL not set");
    return;
  }

  try {
    const convexClient = getClient();
    await convexClient.mutation(api.streamTasks.stopTask, { taskId });
    console.log(`✅ Stopped Convex task for ${taskId}`);
  } catch (error: any) {
    console.error("Error stopping Convex task:", error);
    throw error;
  }
}

