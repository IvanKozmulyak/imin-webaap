-- Replace festival_join_options (JSONB array) with festival_join_option (single VARCHAR)
ALTER TABLE "event_registration" ADD COLUMN "festival_join_option" VARCHAR(50);

-- Migrate: take first element of array into new column
UPDATE "event_registration"
SET "festival_join_option" = "festival_join_options"->>0
WHERE "festival_join_options" IS NOT NULL
  AND jsonb_array_length("festival_join_options") > 0;

ALTER TABLE "event_registration" DROP COLUMN "festival_join_options";
