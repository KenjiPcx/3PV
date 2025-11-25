# Setup Guide

## Quick Start

1. **Install dependencies:**

```bash
pnpm install
```

2. **Set up environment variables:**

### Frontend (`apps/web/.env.local`):
```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Backend (`apps/server/.env.local`):
```env
MEMORIES_AI_API_KEY=sk-xxxxx
CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key
PORT=3001
CALLBACK_BASE_URL=http://localhost:3001
```

**Note:** For production, `CALLBACK_BASE_URL` must be a publicly accessible HTTPS URL.

3. **Initialize Convex:**

```bash
cd apps/convex
pnpm dev
```

Follow the prompts to:
- Create a new Convex project (or use existing)
- Add your Clerk issuer URL to environment variables

4. **Start development servers:**

From the root directory:

```bash
pnpm dev
```

This starts:
- Frontend: `http://localhost:5173` (Vite)
- Backend: `http://localhost:3001` (Express)
- Convex: Dev server (from `apps/convex`)

## Project Structure

```
3PV/
├── apps/
│   ├── web/              # Vite PWA frontend
│   │   ├── src/
│   │   └── package.json
│   ├── convex/           # Convex backend functions
│   │   ├── schema.ts
│   │   ├── streamEvents.ts
│   │   └── package.json
│   └── server/           # Express server
│       ├── src/
│       │   ├── routes/   # API routes
│       │   └── services/ # Business logic
│       └── package.json
├── packages/
│   └── shared/           # Shared types (future)
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

## Testing the Setup

1. **Health check:**
```bash
curl http://localhost:3001/health
```

2. **Start a test stream:**
```bash
curl -X POST http://localhost:3001/api/stream/start \
  -H "Content-Type: application/json" \
  -d '{
    "rtmpUrl": "rtmp://your-stream-url",
    "systemPrompt": "You are a fitness coach.",
    "userPrompt": "Count exercises and report progress."
  }'
```

## Next Steps

1. Build the frontend UI for stream control
2. Add real-time event display
3. Implement gamification UI components
4. Enhance AI coach personality

