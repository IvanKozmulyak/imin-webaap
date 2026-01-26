-- Add imageUrl field to event table for Supabase image storage
ALTER TABLE "event"
ADD COLUMN "image_url" VARCHAR(500);
