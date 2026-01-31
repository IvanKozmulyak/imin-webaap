-- AlterTable
ALTER TABLE "event" ADD COLUMN "use_festival_registration" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "event_registration" ADD COLUMN "festival_join_options" JSONB,
ADD COLUMN "travel_method" VARCHAR(50),
ADD COLUMN "has_car" VARCHAR(50),
ADD COLUMN "car_seats_available" INTEGER,
ADD COLUMN "accommodation_preference" VARCHAR(50),
ADD COLUMN "dance_style" VARCHAR(50),
ADD COLUMN "dance_level" VARCHAR(50),
ADD COLUMN "has_ticket" VARCHAR(50);
