# imin-webapp

Placeholder landing page. Full app to be rebuilt from scratch.

## Stack

- Next.js 14 (App Router)
- Prisma + PostgreSQL (partner-request capture only)

## Setup

```bash
npm install
cp .env.example .env   # set DATABASE_URL
npm run db:migrate     # create partner_request table
npm run dev
```

## Preserved from the old app

- `app/api/partner-request/route.ts` — POST endpoint that captures partner/org email submissions.
- `prisma/schema.prisma` — `PartnerRequest` model backing that endpoint.
