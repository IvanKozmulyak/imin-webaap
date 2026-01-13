# Imin Event Matching System

A Next.js application with TypeScript that implements an event matching system. This system allows users to register for events and automatically groups them based on common languages they speak.

## Features

- Event management with upcoming events API
- User registration for events with language preferences
- Automatic matching algorithm that groups users by common languages
- PostgreSQL database with Prisma ORM
- TypeScript for type safety
- Zod for request validation

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://user:password@localhost:5432/imin?schema=public"
   
   # Telegram API Configuration
   # Get these from https://my.telegram.org/apps
   TELEGRAM_API_ID=your_api_id_here
   TELEGRAM_API_HASH=your_api_hash_here
   
   # Telegram Bot Token (optional but recommended)
   # Get this from @BotFather on Telegram
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   
   # Telegram Session String (required for group creation)
   # This is generated after first authentication. Leave empty for initial setup.
   TELEGRAM_SESSION_STRING=
   
   # Telegram Phone Number (optional, only needed for initial authentication)
   # Format: +1234567890 (include country code)
   TELEGRAM_PHONE_NUMBER=
   ```
   
   **How to get Telegram credentials:**
   - **API ID & API Hash**: Go to https://my.telegram.org/apps and create a new application
   - **Bot Token**: Message @BotFather on Telegram and create a new bot
   - **Session String**: This will be generated automatically after first authentication. For initial setup, you may need to authenticate manually.

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # (Optional) Seed languages
   npm run db:seed
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3000`

## API Endpoints

### Events

- `GET /api/events/upcoming` - Get all upcoming active events

### Event Registrations

- `POST /api/events/[eventId]/registrations` - Register a user for an event

### Languages

- `GET /api/languages` - Get all available languages

### Matching

- `POST /api/events/[eventId]/matching` - Perform matching algorithm for an event
- `GET /api/events/[eventId]/matching` - Get existing matching results for an event

## Database Schema

The application uses PostgreSQL with the following main tables:
- `event` - Events
- `event_registration` - User registrations
- `event_registration_language` - Junction table for registration languages
- `language` - Available languages
- `matching_group` - Matching groups
- `matching_group_language` - Junction table for group languages
- `matching_group_member` - Junction table for group members

## Matching Algorithm

The matching algorithm groups users based on common languages:
- Maximum group size: 5
- Minimum group size: 2
- Users are grouped by shared languages
- Algorithm is deterministic (same input produces same output)

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production (without migrations)
- `npm run build:deploy` - Build for production with database migrations
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run db:studio` - Open Prisma Studio
- `npm run db:migrate` - Run pending migrations (development)
- `npm run db:migrate:deploy` - Apply migrations in production
- `npm run db:seed` - Seed the database with initial data
- `npm run create-telegram-groups` - Create 10 Telegram groups and save invite links to database

## Database Migrations

The project uses Prisma migrations. When deploying to production:

1. **Local Development**: Use `npm run db:migrate` to create and apply migrations
2. **Production Deployment**: The build process (`build:deploy`) automatically runs `prisma migrate deploy` to apply pending migrations
3. **Manual Migration**: If needed, run `npm run db:migrate:deploy` manually in production

### Current Migrations:
- `20260108213425_` - Initial schema (Event, EventRegistration, Language, MatchingGroup tables)
- `20260113135216_1` - Added TelegramGroup table and telegram_group_id to EventRegistration

## Project Structure

```
app/
  api/              # API routes
  layout.tsx        # Root layout
  page.tsx          # Home page
lib/
  db/               # Database configuration
  services/         # Business logic
  types/            # TypeScript types
  utils/            # Utilities (validation, errors, etc.)
prisma/
  migrations/       # Database migrations
  seed.ts           # Seed script
```
