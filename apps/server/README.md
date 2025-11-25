# Express Server - Memories AI Integration

Express.js server that integrates with Memories AI's realtime video understanding API and forwards events to Convex.

## Features

- Start/stop RTMP stream analysis via Memories AI
- Receive and process callbacks from Memories AI
- Forward events to Convex for real-time streaming to mobile app
- Health check endpoint

## Setup

1. **Install dependencies:**

```bash
pnpm install
```

2. **Configure environment variables:**

Copy `.env.example` to `.env.local` and fill in the values:

```env
MEMORIES_AI_API_KEY=sk-xxxxx
CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key
PORT=3001
CALLBACK_BASE_URL=https://your-server.com
```

## Development

```bash
pnpm dev
```

The server will start on `http://localhost:3001` (or the port specified in `PORT`).

## API Endpoints

### `POST /api/stream/start`

Start a new stream analysis.

**Request Body:**
```json
{
  "rtmpUrl": "rtmp://example.com:1935/live/stream",
  "systemPrompt": "You are a fitness coach tracking exercise activities.",
  "userPrompt": "Count the number of kicks and report exercise progress.",
  "thinking": false
}
```

**Response:**
```json
{
  "success": true,
  "taskId": "5347085a-1747-4731-bdde-3856d09502c4",
  "message": "Stream analysis started"
}
```

### `POST /api/stream/stop/:taskId`

Stop an active stream analysis.

**Response:**
```json
{
  "success": true,
  "taskId": "5347085a-1747-4731-bdde-3856d09502c4",
  "message": "Stream analysis stopped"
}
```

### `POST /api/callback/memories-ai`

Callback endpoint for Memories AI (called automatically by Memories AI).

### `GET /health`

Health check endpoint.

## Architecture

```
┌─────────────┐
│ Memories AI │
│   Stream    │
└──────┬──────┘
       │ RTMP Stream
       ▼
┌─────────────┐      Callback      ┌─────────────┐
│ Express     │◄───────────────────│ Memories AI │
│ Server      │                     │   API      │
└──────┬──────┘                     └────────────┘
       │
       │ Forward Events
       ▼
┌─────────────┐
│   Convex    │
│  Database   │
└──────┬──────┘
       │
       │ Real-time Updates
       ▼
┌─────────────┐
│  Mobile App │
│   (PWA)     │
└─────────────┘
```

## Error Handling

The server handles errors gracefully:
- Invalid requests return 400 with error details
- API failures return 500 with error messages
- Callbacks are acknowledged even if processing fails (to prevent retries)

## Production Deployment

For production:
1. Set `CALLBACK_BASE_URL` to your public server URL (must be HTTPS)
2. Ensure your server is accessible from the internet
3. Use a process manager like PM2 or deploy to a platform like Railway, Render, or Fly.io

