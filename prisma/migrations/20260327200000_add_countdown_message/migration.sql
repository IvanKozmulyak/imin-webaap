-- CreateCountdownMessage
CREATE TABLE "countdown_message" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_registration_id" TEXT NOT NULL,
    "message_type" VARCHAR(50) NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT NOW(),

    CONSTRAINT "countdown_message_event_registration_id_fkey" FOREIGN KEY ("event_registration_id") 
        REFERENCES "event_registration"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index for faster lookups
CREATE UNIQUE INDEX "countdown_message_event_registration_id_message_type_key" 
    ON "countdown_message"("event_registration_id", "message_type");

CREATE INDEX "countdown_message_event_registration_id_idx" 
    ON "countdown_message"("event_registration_id");