# 3PV - Drone Intelligence & Life Gamification Project

## Project Overview

A gamified life assistant powered by a drone with AI vision. The drone uses Memories AI's realtime video understanding API to analyze live video streams and provide contextual insights, exercise tracking, and motivational coaching (like David Goggins).

## Architecture

### Monorepo Structure (Turbo)
- `apps/web` - Vite PWA frontend (React + Clerk + Tailwind v4)
- `apps/convex` - Convex backend functions (shared by web and server)
- `apps/server` - Express server for Memories AI integration
- `packages/shared` - Shared types and utilities (future)

### Tech Stack
- **Frontend**: Vite PWA (React + Convex + Clerk + Tailwind CSS)
- **Backend**: Express.js (Node.js)
- **Database/Realtime**: Convex
- **AI Vision**: Memories AI Realtime API
- **Monorepo**: Turbo
- **Package Manager**: pnpm

## Key Features

1. **RTMP Stream Processing**: Accept RTMP URLs and start/stop video analysis
2. **Real-time Event Detection**: Process Memories AI callbacks and detect interesting events
3. **Life Gamification**: 
   - HP bars
   - Exercise counters (kicks, reps, etc.)
   - Activity tracking
4. **AI Coach Personality**: Drone assistant with motivational coaching
5. **Mobile Streaming**: Stream events to phone via Convex

## Current Progress

### ✅ Completed
- Initial Convex + Vite app setup
- Clerk authentication integration
- Turbo monorepo structure setup
- Express server with Memories AI API integration
- Convex mutations for receiving and processing events
- Stream task management in Convex
- Gamification data models (HP, exercise counters)
- AI coach message system
- **Frontend UI Implementation**:
    - "Drone HUD" aesthetic (Cyberpunk/Sci-fi theme)
    - Stream View with overlays
    - Health Bars and Stat Boxes
    - Control Panel for Stream/Prompts
    - Message Feed for AI updates

### 🚧 In Progress
- Connecting Frontend UI to Backend API (Start/Stop Stream)
- Real-time data sync for HUD stats

### 📋 Todo
- [x] Vite PWA UI for RTMP URL input and stream control (UI Built)
- [x] Gamification UI (HP bars, counters, activity feed) (UI Built)
- [ ] Connect Frontend "Start Stream" to Express API
- [ ] Subscribe Frontend HUD to Convex real-time data
- [ ] Enhanced event detection and filtering logic (AI-based)
- [ ] AI coach personality system (more sophisticated prompts)
- [ ] User authentication integration with stream tasks
- [ ] Mobile app optimization

## Frontend Architecture

### Theme
- **Style**: Sci-fi / Drone HUD / Cyberpunk
- **Colors**: Dark background (`#050505`), Neon Cyan (`#00f0ff`) primary, Neon Green (`#0aff0a`) success.
- **Effects**: Scanlines, Grid Backgrounds, Angled Corners (`clip-path`), Glow effects.

### Components
- **StreamView**: Central video container with crosshairs and overlays.
- **HUD**: `HealthBar`, `StatBox`, `MessageFeed`.
- **ControlPanel**: Form for RTMP URL, System Prompt, and User Prompt.

## API Integration Details

### Memories AI Stream API
- **Base URL**: `https://stream.memories.ai`
- **Endpoints**:
  - `POST /v1/understand/streamConnect` - Start stream analysis
  - `POST /v1/understand/stop/{task_id}` - Stop stream
- **Limits**: 4 concurrent streams per API key
- **Billing**: Every 5 seconds per active stream

### Callback Payload Structure
```json
{
  "status": 0,
  "task_id": "uuid",
  "data": {
    "text": "Analysis text",
    "timestamp": "ISO timestamp"
  }
}
```

## Project Structure

```
3PV/
├── .doc/
│   └── context.md (this file)
├── apps/
│   ├── web/          # Vite PWA frontend
│   ├── convex/       # Convex backend functions
│   └── server/       # Express server
├── packages/
│   └── shared/       # Shared types/utils
├── turbo.json
├── package.json      # Root workspace config
└── pnpm-workspace.yaml
```

## Environment Variables

### Express Server
- `MEMORIES_AI_API_KEY` - Memories AI API key
- `CONVEX_URL` - Convex deployment URL
- `CONVEX_DEPLOY_KEY` - Convex deploy key for mutations
- `PORT` - Server port (default: 3001)
- `CALLBACK_BASE_URL` - Public URL for Memories AI callbacks

### Frontend
- `VITE_CONVEX_URL` - Convex deployment URL
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
