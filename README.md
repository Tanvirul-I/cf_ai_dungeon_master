# AI Dungeon Master

A text-based fantasy RPG powered by AI. An intelligent Dungeon Master generates immersive scenes, tracks your inventory, remembers NPCs, and reacts to your every action, all running on Cloudflare's edge.

🔗 **Live Demo**: [ai-dungeon-master.tanvirul.workers.dev](https://ai-dungeon-master.tanvirul.workers.dev)

## Tech Stack

### LLM

Uses **Llama 3.3 70B** (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`) via **Workers AI**. The model acts as the Dungeon Master, generating narrative responses grounded in conversation history and a system prompt that enforces narrative continuity.

### Workflow / Coordination

**Durable Objects** manage each game room (`GameRoom` class in `src/game-engine.ts`). Each Durable Object handles:
- Initializing new adventures (`/init`)
- Processing player turns (`/turn`)
- Resetting games (`/reset`)
- Returning full history (`/history`)

**Next.js Server Actions** (`src/app/actions.ts`) coordinate between the frontend and Durable Objects.

### User Input

Players interact via a **chat interface** built with **Cloudflare Pages** (Next.js via OpenNext). The UI is a real-time chat panel where players type actions and receive AI-narrated responses.

### Memory / State

Game state is persisted in **Durable Object SQLite storage**. A `history` table stores every message (both player actions and AI responses) in order, enabling:
- Full conversation history on page reload
- Consistent AI context across turns
- Per-user game rooms via unique IDs stored in `localStorage`

### Database Schema

Each Durable Object stores a SQLite `history` table:

| Column    | Type    | Description |
|-----------|---------|-------------|
| `id`      | INTEGER | Auto-incrementing primary key, preserves message order |
| `role`    | TEXT    | Who sent the message — `"user"` (player action) or `"assistant"` (AI narration) |
| `content` | TEXT    | The message body |

These roles map directly to the LLM chat completion API format. A third role, `"system"`, contains the Dungeon Master's behavioral rules and is prepended to every AI request but never stored in the database.

## Getting Started

```bash
npm install
npm run dev
```

Open localhost link provided in the terminal to start your adventure.

## Preview (Cloudflare Runtime)

```bash
npm run preview
```

## Deploy

```bash
npm run deploy
```
