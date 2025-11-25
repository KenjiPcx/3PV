# 3PV - Drone Intelligence & Life Gamification

> **Transform your life into a game with an AI-powered drone assistant**

A real-time video understanding system that gamifies your daily activities through a drone's perspective. Track exercises, monitor health metrics, and receive motivational coaching from your flying AI companion.

## 🎮 Features

- **Real-time Video Analysis**: Process live RTMP streams using Memories AI
- **Life Gamification**: HP bars, exercise counters, activity tracking
- **AI Coach**: Motivational assistant with personality (inspired by David Goggins)
- **Mobile Streaming**: Real-time event updates to your phone via Convex
- **Exercise Detection**: Automatic counting of kicks, reps, and other activities
- **PWA Support**: Installable progressive web app for mobile use

## 🏗️ Architecture

This is a Turbo monorepo containing:

- **`apps/web`** - Vite PWA frontend (React + Clerk)
- **`apps/convex`** - Convex backend functions (shared by web and server)
- **`apps/server`** - Express.js server for Memories AI integration
- **`packages/shared`** - Shared TypeScript types and utilities

### Tech Stack

- **Frontend**: Vite, React, Convex, Clerk, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database/Realtime**: Convex
- **AI Vision**: [Memories AI Realtime API](https://memories.ai)
- **Monorepo**: Turbo
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Convex account ([sign up](https://convex.dev))
- Clerk account ([sign up](https://clerk.com))
- Memories AI API key ([get one](https://memories.ai))

### Installation

1. **Clone and install dependencies:**

```bash
git clone <your-repo>
cd 3PV
pnpm install
```

2. **Set up environment variables:**

Create `.env.local` files in each app:

**`apps/web/.env.local`:**
```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**`apps/server/.env.local`:**
```env
MEMORIES_AI_API_KEY=sk-xxxxx
CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key
PORT=3001
CALLBACK_BASE_URL=https://your-server.com
```

3. **Configure Convex:**

```bash
cd apps/convex
pnpm dev
```

Follow the prompts to set up your Convex deployment and add the Clerk issuer URL.

4. **Start development servers:**

From the root directory:

```bash
pnpm dev
```

This will start:
- Frontend dev server (usually `http://localhost:5173`)
- Express server (usually `http://localhost:3001`)
- Convex dev server

## 📖 Usage

### Starting a Stream

1. Open the web app in your browser
2. Enter your RTMP stream URL
3. Configure prompts:
   - **System Prompt**: Define the AI's role (e.g., "You are a fitness coach tracking exercise")
   - **User Prompt**: What to analyze (e.g., "Count the number of kicks and report exercise progress")
4. Click "Start Stream"
5. The drone will begin analyzing and streaming events to your phone

### Stopping a Stream

Click "Stop Stream" in the web app or call the stop endpoint directly.

## 🔌 API Endpoints

### Express Server

#### Start Stream Analysis
```http
POST /api/stream/start
Content-Type: application/json

{
  "rtmpUrl": "rtmp://example.com:1935/live/stream",
  "systemPrompt": "Track exercise activities",
  "userPrompt": "Count kicks and report progress"
}
```

#### Stop Stream
```http
POST /api/stream/stop/:taskId
```

#### Health Check
```http
GET /health
```

### Memories AI Callback

The Express server automatically handles Memories AI callbacks at:
```http
POST /api/callback/memories-ai
```

## 🎯 Gamification Features

### HP Bars
Track your "health points" based on activities:
- Exercise increases HP
- Inactivity decreases HP
- Custom rules configurable

### Exercise Counters
- Automatic detection of kicks, punches, jumps
- Rep counting for various exercises
- Activity duration tracking

### AI Coach
- Real-time motivational messages
- Progress updates
- Personalized coaching based on activity patterns

## 🏗️ Development

### Project Structure

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
│       └── package.json
├── packages/
│   └── shared/           # Shared types/utils
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

### Available Scripts

- `pnpm dev` - Start all dev servers
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm test` - Run tests (when added)

### Adding a New Package

1. Create directory in `apps/` or `packages/`
2. Add `package.json` with name matching directory
3. Update `pnpm-workspace.yaml` if needed
4. Add to `turbo.json` pipeline if needed

## 🔐 Security

- API keys stored in environment variables
- Clerk authentication for user management
- Convex handles database security
- Callback URLs should use HTTPS in production

## 📝 License

[Your License Here]

## 🤝 Contributing

[Contributing guidelines]

## 🙏 Acknowledgments

- [Memories AI](https://memories.ai) for video understanding API
- [Convex](https://convex.dev) for real-time database
- [Clerk](https://clerk.com) for authentication
- Inspired by David Goggins' motivational approach

## 📚 Resources

- [Memories AI Documentation](https://memories.ai/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Turbo Documentation](https://turbo.build/repo/docs)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

