# Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   Create `.env.local`:
   ```env
   VITE_CONVEX_URL=https://your-deployment.convex.cloud
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

   **In Convex Dashboard** (Settings → Environment Variables):
   ```env
   MEMORIES_AI_API_KEY=sk-xxxxx
   ```

3. **Initialize Convex:**
   ```bash
   pnpm dev
   ```

   Follow the prompts to:
   - Create a new Convex project (or use existing)
   - Add your Clerk issuer URL to environment variables

4. **Start development:**
   ```bash
   pnpm dev
   ```

   This starts:
   - Frontend: `http://localhost:5173` (Vite)
   - Convex: Dev server (automatic)

## Project Structure

```
3PV/
├── convex/           # Convex backend (functions, HTTP actions, schema)
│   ├── http.ts       # HTTP router for Memories AI callbacks
│   ├── memoriesAI.ts # Actions to call Memories AI API
│   ├── streamActions.ts # Combined stream management actions
│   ├── streamTasks.ts   # Task management mutations/queries
│   └── streamEvents.ts  # Event processing and gamification
├── src/              # React frontend
│   ├── components/   # UI components
│   ├── hooks/        # React hooks
│   └── main.tsx      # App entry point
├── public/           # Static assets
└── package.json
```

## Testing the Setup

1. **Start your RTMP stream** from your phone to your RTMP server

2. **In the 3PV app:**
   - Enter RTMP URL: `rtmp://your-server/stream/livestream`
   - Enter HLS URL: `http://localhost:8080/hls/livestream.m3u8` (for video display)
   - Click "INITIATE LINK"

3. **Check Convex logs** for callback processing

## Architecture

Everything runs on Convex:
- **HTTP Actions**: Receive callbacks from Memories AI
- **Actions**: Call external APIs (Memories AI)
- **Mutations**: Store data in Convex database
- **Queries**: Real-time data for UI

No Express server needed! 🎉
