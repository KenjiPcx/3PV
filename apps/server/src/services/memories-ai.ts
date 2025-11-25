import axios from "axios";

const MEMORIES_AI_BASE_URL = "https://stream.memories.ai";
const API_KEY = process.env.MEMORIES_AI_API_KEY;

if (!API_KEY) {
  console.warn("⚠️  MEMORIES_AI_API_KEY not set. Stream operations will fail.");
}

interface StartStreamParams {
  url: string;
  systemPrompt: string;
  userPrompt: string;
  callback: string;
  thinking?: boolean;
}

interface StartStreamResponse {
  status: number;
  task_id: string;
  text?: string;
}

interface StopStreamResponse {
  status: number;
  task_id: string;
}

export async function startStream(params: StartStreamParams): Promise<StartStreamResponse> {
  if (!API_KEY) {
    throw new Error("MEMORIES_AI_API_KEY environment variable is not set");
  }

  const response = await axios.post<StartStreamResponse>(
    `${MEMORIES_AI_BASE_URL}/v1/understand/streamConnect`,
    {
      url: params.url,
      system_prompt: params.systemPrompt,
      user_prompt: params.userPrompt,
      callback: params.callback,
      thinking: params.thinking ?? false,
    },
    {
      headers: {
        Authorization: API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.data.status !== 0) {
    throw new Error(`Failed to start stream: status ${response.data.status}`);
  }

  return response.data;
}

export async function stopStream(taskId: string): Promise<StopStreamResponse> {
  if (!API_KEY) {
    throw new Error("MEMORIES_AI_API_KEY environment variable is not set");
  }

  const response = await axios.post<StopStreamResponse>(
    `${MEMORIES_AI_BASE_URL}/v1/understand/stop/${taskId}`,
    {},
    {
      headers: {
        Authorization: API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

