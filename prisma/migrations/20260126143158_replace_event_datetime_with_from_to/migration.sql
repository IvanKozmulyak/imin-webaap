-- Replace event_date_time with from_date_time and to_date_time
-- Step 1: Add new columns (nullable initially)
ALTER TABLE "event"
ADD COLUMN "from_date_time" TIMESTAMP(3),
ADD COLUMN "to_date_time" TIMESTAMP(3);

-- Step 2: Migrate existing data
-- Copy event_date_time to from_date_time
-- Set to_date_time to from_date_time + 8 hours (default duration for existing events)
UPDATE "event"
SET 
  "from_date_time" = "event_date_time",
  "to_date_time" = "event_date_time" + INTERVAL '8 hours'
WHERE "from_date_time" IS NULL;

-- Step 3: Make columns NOT NULL
ALTER TABLE "event"
ALTER COLUMN "from_date_time" SET NOT NULL,
ALTER COLUMN "to_date_time" SET NOT NULL;

-- Step 4: Drop the old column
ALTER TABLE "event"
DROP COLUMN "event_date_time";
