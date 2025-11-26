"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const MEMORIES_AI_BASE_URL = "https://stream.memories.ai";

interface StartStreamParams {
  url: string;
  systemPrompt: string;
  userPrompt: string;
  callback: string;
  thinking?: boolean;
}

interface StartStreamResponse {
  code?: number;
  msg?: string;
  data?: {
    task_id: string;
  };
  status?: number;
  task_id?: string;
}

/**
 * Helper function to start a Memories AI stream analysis
 * Can be called directly from other actions without crossing runtimes
 */
export async function startMemoriesAIStream(params: {
  rtmpUrl: string;
  systemPrompt: string;
  userPrompt: string;
  callbackUrl: string;
  thinking?: boolean;
}): Promise<{ taskId: string }> {
  const API_KEY = process.env.MEMORIES_AI_API_KEY?.trim();
  if (!API_KEY) {
    throw new Error("MEMORIES_AI_API_KEY environment variable is not set");
  }

  if (!API_KEY.startsWith('sk-')) {
    console.warn(`⚠️ Warning: API key doesn't start with 'sk-'. Got: ${API_KEY.substring(0, 10)}...`);
  }

  console.log(`[memories-ai] Starting stream analysis for: ${params.rtmpUrl}`);
  console.log(`[memories-ai] Callback URL: ${params.callbackUrl}`);
  console.log(`[memories-ai] API Key: ${API_KEY.substring(0, 7)}...${API_KEY.substring(API_KEY.length - 4)} (length: ${API_KEY.length})`);

  const requestPayload = {
    url: params.rtmpUrl,
    system_prompt: params.systemPrompt,
    user_prompt: params.userPrompt,
    callback: params.callbackUrl,
    thinking: params.thinking ?? false,
  };

  console.log(`[memories-ai] Request payload:`, JSON.stringify(requestPayload, null, 2));

  try {
    const response = await fetch(`${MEMORIES_AI_BASE_URL}/v1/understand/streamConnect`, {
      method: "POST",
      headers: {
        Authorization: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    console.log(`[memories-ai] Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.msg || `HTTP ${response.status}`);
    }

    const responseData: StartStreamResponse = await response.json();
    console.log(`[memories-ai] Response:`, JSON.stringify(responseData, null, 2));

    // Handle documented API format: { status: 0, task_id: "...", text: "" }
    if (responseData.status !== undefined) {
      // Check for error codes according to API docs:
      // -1 = Invalid request or parameters
      // 1001 = Maximum concurrent streams reached (4 per key)
      // 2001 = Credit deduction failed
      // 5000 = Internal server error
      if (responseData.status === -1) {
        throw new Error(`Invalid request or parameters`);
      } else if (responseData.status === 1001) {
        throw new Error(`Maximum concurrent streams reached (4 per API key)`);
      } else if (responseData.status === 2001) {
        throw new Error(`Credit deduction failed - please recharge your account`);
      } else if (responseData.status === 5000) {
        throw new Error(`Internal server error`);
      } else if (responseData.status !== 0) {
        throw new Error(`Failed to start stream: status ${responseData.status}`);
      }

      if (!responseData.task_id) {
        throw new Error(`Failed to start stream: task_id not found in response`);
      }

      return { taskId: responseData.task_id };
    }

    // Handle alternative API format: { code: 0, msg: "success", data: { task_id: "..." } }
    // (Some API versions may use this format)
    if (responseData.code !== undefined) {
      if (responseData.code !== 0) {
        const errorMsg = responseData.msg || `code ${responseData.code}`;
        throw new Error(`Failed to start stream: ${errorMsg}`);
      }

      if (!responseData.data?.task_id) {
        throw new Error(`Failed to start stream: task_id not found in response`);
      }

      return { taskId: responseData.data.task_id };
    }

    throw new Error(`Failed to start stream: unexpected response format`);
  } catch (error: any) {
    console.error(`[memories-ai] Error:`, error);
    throw error;
  }
}

/**
 * Helper function to stop a Memories AI stream analysis
 * Can be called directly from other actions without crossing runtimes
 */
export async function stopMemoriesAIStream(taskId: string): Promise<{ taskId: string }> {
  const API_KEY = process.env.MEMORIES_AI_API_KEY?.trim();
  if (!API_KEY) {
    throw new Error("MEMORIES_AI_API_KEY environment variable is not set");
  }

  console.log(`[memories-ai] Stopping stream task: ${taskId}`);

  try {
    const response = await fetch(`${MEMORIES_AI_BASE_URL}/v1/understand/stop/${taskId}`, {
      method: "POST",
      headers: {
        Authorization: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    console.log(`[memories-ai] Stop response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.msg || `HTTP ${response.status}`);
    }

    const responseData = await response.json();
    console.log(`[memories-ai] Stop response:`, JSON.stringify(responseData, null, 2));

    return { taskId };
  } catch (error: any) {
    console.error(`[memories-ai] Stop error:`, error);
    throw error;
  }
}

/**
 * Start a Memories AI stream analysis (action wrapper for backward compatibility)
 */
export const startStream = action({
  args: {
    rtmpUrl: v.string(),
    systemPrompt: v.string(),
    userPrompt: v.string(),
    callbackUrl: v.string(),
    thinking: v.optional(v.boolean()),
  },
  returns: v.object({
    taskId: v.string(),
  }),
  handler: async (ctx, args) => {
    return await startMemoriesAIStream({
      rtmpUrl: args.rtmpUrl,
      systemPrompt: args.systemPrompt,
      userPrompt: args.userPrompt,
      callbackUrl: args.callbackUrl,
      thinking: args.thinking,
    });
  },
});

/**
 * Stop a Memories AI stream analysis
 */
export const stopStream = action({
  args: {
    taskId: v.string(),
  },
  returns: v.object({
    taskId: v.string(),
  }),
  handler: async (ctx, args) => {
    return await stopMemoriesAIStream(args.taskId);
  },
});

