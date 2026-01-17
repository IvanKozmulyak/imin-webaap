-- Add new column first (nullable initially)
ALTER TABLE "partner_request" 
ADD COLUMN IF NOT EXISTS "annual_attendees" VARCHAR(50);

-- Set default value for existing rows
UPDATE "partner_request" 
SET "annual_attendees" = 'Under 10,000' 
WHERE "annual_attendees" IS NULL;

-- Make column NOT NULL
ALTER TABLE "partner_request" 
ALTER COLUMN "annual_attendees" SET NOT NULL,
ALTER COLUMN "annual_attendees" SET DEFAULT 'Under 10,000';

-- Drop old columns
ALTER TABLE "partner_request" 
DROP COLUMN IF EXISTS "name",
DROP COLUMN IF EXISTS "phone",
DROP COLUMN IF EXISTS "message";
