-- Add optional country and city fields for event registrations
ALTER TABLE "event_registration"
ADD COLUMN "country" VARCHAR(255),
ADD COLUMN "city" VARCHAR(255);

