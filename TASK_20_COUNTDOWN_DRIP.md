# Task 20: Event Countdown Drip Campaign

## Summary
Implemented an automated multi-day messaging sequence (T-7, T-3, T-1) to maintain user engagement and prevent churn leading up to the event date.

## Features
- **T-7 Message**: 1 week before event - excitement building, quick tips
- **T-3 Message**: 3 days before event - logistics reminder
- **T-1 Message**: Day before event - meeting point info, final encouragement

## Files Created/Modified

### New Files
1. **lib/services/countdownDripService.ts** - Core service for processing and sending countdown messages
2. **app/api/countdown/drip/route.ts** - API endpoint to trigger the drip campaign
3. **prisma/migrations/20260327200000_add_countdown_message/migration.sql** - Database migration
4. **prisma/schema.prisma** - Added CountdownMessage model

### Modified Files
- **prisma/schema.prisma** - Added CountdownMessage model and relation to EventRegistration

## API Endpoint
```
POST /api/countdown/drip
```

Response:
```json
{
  "success": true,
  "message": "Processed X registrations, sent Y messages, Z errors",
  "stats": {
    "processed": 10,
    "sent": 3,
    "errors": 0
  }
}
```

## Cron Setup (Recommended)

Add a cron job to run daily at 9 AM:

```bash
# Daily at 9 AM UTC
curl -X POST https://imin.wtf/api/countdown/drip
```

Or use Vercel Cron (recommended):
1. Create `app/api/countdown/cron/route.ts` with cron protection
2. Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/countdown/drip",
      "schedule": "0 9 * * *"
    }
  ]
}
```

## Bilingual Support
Messages are sent in the event's configured language (en/uk).

## Database Requirements
Run migration: `npx prisma migrate deploy`

Or apply manually:
```sql
CREATE TABLE "countdown_message" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_registration_id" TEXT NOT NULL REFERENCES "event_registration"("id") ON DELETE CASCADE,
    "message_type" VARCHAR(50) NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    UNIQUE("event_registration_id", "message_type")
);
```