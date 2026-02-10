# ImIn Web App

ImIn is a Next.js application for event discovery, social matching, and Telegram-based group coordination.  
It helps event organizers convert solo attendees into small squads by matching people with shared preferences and routing them into Telegram groups.

The repository includes:
- A marketing and partner landing experience
- Event listing and registration flows (nightlife + festival modes)
- Matching APIs and group assignment logic
- Telegram group creation and webhook automation
- Prisma migrations and seed data

## Table of Contents

- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Core Workflow](#core-workflow)
- [API Reference](#api-reference)
- [NPM Scripts](#npm-scripts)
- [Project Structure](#project-structure)
- [Deployment Notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)

## Tech Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Validation**: Zod
- **Styling**: Tailwind CSS + custom CSS
- **Integrations**:
  - Telegram Bot API + GramJS
  - OpenRouter (LLM responses for bot interactions)
  - Supabase Storage (event image uploads)
  - Mapbox Geocoding (city autocomplete)

## Quick Start

### 1) Prerequisites

- Node.js 18+
- npm
- PostgreSQL database

### 2) Install dependencies

```bash
npm install
```

### 3) Create local environment file

Create `.env.local` in the project root:

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/imin?schema=public"

# Telegram (required for Telegram group creation / webhook features)
TELEGRAM_API_ID=
TELEGRAM_API_HASH=
TELEGRAM_SESSION_STRING=
TELEGRAM_PHONE_NUMBER=
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=imin_squad_bot

# LLM (required for bot AI responses)
OPENROUTER_API_KEY=
OPENROUTER_MODEL=anthropic/claude-sonnet-4.5

# Mapbox (optional, enables city autocomplete in registration form)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=

# Supabase Storage (optional, required only for /api/events/upload-image)
SUPABASE_PROJECT_REF=
SUPABASE_REGION=us-east-1
SUPABASE_ACCESS_KEY_ID=
SUPABASE_SECRET_ACCESS_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 4) Setup database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial languages (recommended)
npm run db:seed
```

### 5) Start development server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Environment Variables

| Variable | Required | Used By | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma client, API routes | PostgreSQL connection string |
| `TELEGRAM_API_ID` | For Telegram group creation | `lib/services/telegramService.ts` | From https://my.telegram.org/apps |
| `TELEGRAM_API_HASH` | For Telegram group creation | `lib/services/telegramService.ts` | From https://my.telegram.org/apps |
| `TELEGRAM_SESSION_STRING` | Recommended for Telegram group creation | `lib/services/telegramService.ts` | Persisted GramJS session; avoids interactive auth |
| `TELEGRAM_PHONE_NUMBER` | Optional fallback | `lib/services/telegramService.ts` | Used only for first-time auth flows |
| `TELEGRAM_BOT_TOKEN` | For webhook + bot messaging | `lib/services/telegramBotService.ts` | From @BotFather |
| `TELEGRAM_BOT_USERNAME` | No | Bot mention detection | Defaults to `imin_squad_bot` |
| `OPENROUTER_API_KEY` | For AI replies | `lib/services/llmService.ts` | Required for Telegram bot LLM responses |
| `OPENROUTER_MODEL` | No | `lib/services/llmService.ts` | Defaults to `anthropic/claude-sonnet-4.5` |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | No | `app/register/page.tsx` | Enables city autocomplete |
| `SUPABASE_PROJECT_REF` | For image upload | `lib/services/supabaseService.ts` | Supabase project ref |
| `SUPABASE_REGION` | No | `lib/services/supabaseService.ts` | Defaults to `us-east-1` |
| `SUPABASE_ACCESS_KEY_ID` | For image upload | `lib/services/supabaseService.ts` | S3-compatible key |
| `SUPABASE_SECRET_ACCESS_KEY` | For image upload | `lib/services/supabaseService.ts` | S3-compatible secret |
| `NEXT_PUBLIC_SUPABASE_URL` | For image upload URL generation | `lib/services/supabaseService.ts` | Public project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For image upload URL generation | `lib/services/supabaseService.ts` | Public anon key |

### Legacy/test-only LLM vars

`/api/test/llm` still checks some legacy provider keys (`GEMINI_API_KEY`, `EDENAI_API_KEY`, `PINECONE_API_KEY`, `PINECONE_ASSISTANT_NAME`, plus related model vars).  
Main bot response generation currently uses `OPENROUTER_API_KEY`.

## Core Workflow

### 1) Seed languages

Run:

```bash
npm run db:seed
```

### 2) Add events

There is no public `POST /api/events` endpoint yet.  
Create events directly in PostgreSQL or through Prisma Studio:

```bash
npm run db:studio
```

### 3) (Optional) Pre-create Telegram groups for an event

Use API:

```bash
curl -X POST "http://localhost:3000/api/events/<eventId>/telegram-groups" \
  -H "Content-Type: application/json" \
  -d '{"numberOfGroups":10,"maxMembersPerGroup":5,"botUsername":"imin_squad_bot"}'
```

For festival registration events (`useFestivalRegistration = true`), create one group per festival join option:

```bash
curl -X POST "http://localhost:3000/api/events/<eventId>/telegram-groups" \
  -H "Content-Type: application/json" \
  -d '{"createFestivalGroups":true}'
```

### 4) Collect registrations

```bash
curl -X POST "http://localhost:3000/api/events/<eventId>/registrations" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Alex",
    "email":"alex@example.com",
    "age":29,
    "sex":"male",
    "languagesISpeak":["en","es"],
    "country":"Spain",
    "city":"Barcelona"
  }'
```

### 5) Run matching

```bash
curl -X POST "http://localhost:3000/api/events/<eventId>/matching"
```

### 6) Configure Telegram webhook (for welcome messages and bot behavior)

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-domain.com/api/telegram/webhook"}'
```

Check webhook:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

Remove webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook"
```

## API Reference

All routes are under `app/api/**`.

### Events

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/events` | All active events (includes past active events) |
| `GET` | `/api/events/upcoming` | Active events whose `toDateTime` is in the future |
| `GET` | `/api/events/:eventId` | Event details by ID |
| `POST` | `/api/events/upload-image` | Upload event image (multipart form) and persist URL |

### Registration + Matching

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/events/:eventId/registrations` | Register attendee for an event |
| `POST` | `/api/events/:eventId/matching` | Rebuild matching groups for an event |
| `GET` | `/api/events/:eventId/matching` | Fetch existing matching results |

### Telegram

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/events/:eventId/telegram-groups` | Create Telegram groups for an event |
| `POST` | `/api/telegram/webhook` | Receive Telegram updates |
| `GET` | `/api/telegram/webhook` | Webhook health check |

### Other

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/languages` | List language options |
| `POST` | `/api/partner-request` | Submit partner lead form |
| `POST` | `/api/test/llm` | LLM test endpoint |
| `GET` | `/api/test/llm` | Get stored conversation history |
| `DELETE` | `/api/test/llm` | Clear stored conversation history |

### Upload image endpoint example

```bash
curl -X POST "http://localhost:3000/api/events/upload-image" \
  -F "eventId=<eventId>" \
  -F "fileName=poster.jpg" \
  -F "file=@/absolute/path/to/poster.jpg"
```

## NPM Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Run Prisma deploy + generate, then Next build |
| `npm run build:deploy` | Same as `build` |
| `npm run start` | Start production server |
| `npm run lint` | Run Next.js lint checks |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run development migrations |
| `npm run db:migrate:deploy` | Apply migrations in deploy/prod mode |
| `npm run db:push` | Push schema directly without migration files |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed base language data |
| `npm run create-telegram-groups -- <eventId>` | Create Telegram groups via script |

## Project Structure

```text
app/
  api/                         # HTTP API routes
  components/                  # Shared UI components
  events/                      # Events page
  register/                    # Registration flow
  page.tsx                     # Landing page
lib/
  db/                          # Prisma client
  services/                    # Domain + integration services
  types/                       # DTOs and app types
  utils/                       # Validation + response utilities
prisma/
  migrations/                  # Prisma migration history
  schema.prisma               # Main Prisma schema
  seed.ts                      # Seed script
public/
  assets/                      # Static assets
scripts/
  create-telegram-groups.ts    # Telegram group bootstrap script
```

Note: `src/` also exists and appears to contain older prototype files; the active app runs from `app/`.

## Deployment Notes

- `npm run build` already runs:
  1. `prisma migrate deploy`
  2. `prisma generate`
  3. `next build`
- `vercel.json` uses:
  - `installCommand: npm install`
  - `buildCommand: npm run build`

For production deployments, ensure all required environment variables are configured in your hosting platform.

## Troubleshooting

### Prisma client or migration issues

```bash
npm run db:generate
npm run db:migrate
```

If schema and DB drift in local dev, `npm run db:push` can help during iteration.

### Telegram group creation fails

Check:
- `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` are set correctly
- `TELEGRAM_SESSION_STRING` is valid (or provide phone number for first-time auth flow)
- The bot has adequate permissions in target groups

### No welcome messages in Telegram

Check:
- `TELEGRAM_BOT_TOKEN` is set
- Webhook points to `/api/telegram/webhook`
- `GET /api/telegram/webhook` returns health status

### LLM responses are empty

Check:
- `OPENROUTER_API_KEY` is present
- `OPENROUTER_MODEL` is valid for your OpenRouter account

---

If you are extending this project, start in `lib/services/*` for domain logic and `app/api/*` for route behavior.
