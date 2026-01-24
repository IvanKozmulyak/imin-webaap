-- Add optional message field for partner requests (used by Contact form)
ALTER TABLE "partner_request"
ADD COLUMN "message" TEXT;

