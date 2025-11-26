# 3PV - Drone Intelligence & Life Gamification Platform

A real-time video analysis platform that uses AI to track activities and gamify fitness through live RTMP streams.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Convex (database, serverless functions, HTTP actions)
- **Authentication**: Clerk
- **Video Streaming**: HLS.js for playback, RTMP for input
- **AI Analysis**: Memories AI for real-time video understanding

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

## How It Works

1. **Start Stream**: User provides RTMP URL → Convex action calls Memories AI API
2. **AI Analysis**: Memories AI analyzes video stream → Sends callbacks to Convex HTTP endpoint
3. **Real-time Updates**: Callbacks stored in Convex → UI updates automatically via queries
4. **Gamification**: Events processed for exercise detection → Updates HP, scores, coach messages

## Features

- 🎥 **Live Video Streaming**: View RTMP streams via HLS playback
- 🤖 **AI Analysis**: Real-time transcription and activity recognition
- 🎮 **Gamification**: HP system, exercise counting, AI coach messages
- 📊 **Real-time Dashboard**: Live stats, message feed, stream controls

## API Endpoints (Convex HTTP Actions)

- `POST /callback/memories-ai` - Receives callbacks from Memories AI
- All other operations use Convex queries/mutations/actions

## Environment Variables

### Frontend (`.env.local`)
- `VITE_CONVEX_URL` - Your Convex deployment URL
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key

### Convex Dashboard
- `MEMORIES_AI_API_KEY` - Your Memories AI API key

## Development

```bash
# Install dependencies
pnpm install

# Start dev server (frontend + Convex)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## License

See LICENSE.txt
