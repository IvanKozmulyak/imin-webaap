## Summary

Implements the IMIN Ambassador program for high-retention users to help with event recruitment and manual squad creation.

### Changes

- **Prisma Schema**: Added `Ambassador` model for tracking events attended, squads created, referrals, rating score, verification status, and badge levels

- **Ambassador Service** (`lib/services/ambassadorService.ts`): Check qualification, manage records, create squads, generate referral codes

- **Telegram Bot Commands**: `/ambassador`, `/referral`, `/create-squad`

- **API Endpoint**: `/api/ambassador` for REST operations

### Benefits Tier

| Badge | Requirements | Commission |
|-------|--------------|------------|
| Bronze | 3 events, 3.5+ rating, 3 refs | 3% |
| Silver | 5 events, 4+ rating, 5 refs | 5% |
| Gold | 10 events, 4.5+ rating, 10 refs | 10% |