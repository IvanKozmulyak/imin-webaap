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
   Create a `.env` file in the root directory:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/imin?schema=public"
   ```

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
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run db:studio` - Open Prisma Studio

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
