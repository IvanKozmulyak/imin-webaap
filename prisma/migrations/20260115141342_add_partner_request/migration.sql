-- CreateTable
CREATE TABLE "partner_request" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "organization" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "partner_request_email_idx" ON "partner_request"("email");

-- CreateIndex
CREATE INDEX "partner_request_created_at_idx" ON "partner_request"("created_at");
