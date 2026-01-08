-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(2000),
    "event_date_time" TIMESTAMP(3) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "ticket_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registration" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telegram" VARCHAR(255) NOT NULL,
    "age" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registration_language" (
    "event_registration_id" TEXT NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,

    CONSTRAINT "event_registration_language_pkey" PRIMARY KEY ("event_registration_id","language_code")
);

-- CreateTable
CREATE TABLE "language" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matching_group" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matching_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matching_group_language" (
    "matching_group_id" TEXT NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,

    CONSTRAINT "matching_group_language_pkey" PRIMARY KEY ("matching_group_id","language_code")
);

-- CreateTable
CREATE TABLE "matching_group_member" (
    "matching_group_id" TEXT NOT NULL,
    "event_registration_id" TEXT NOT NULL,

    CONSTRAINT "matching_group_member_pkey" PRIMARY KEY ("matching_group_id","event_registration_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_registration_telegram_key" ON "event_registration"("telegram");

-- CreateIndex
CREATE INDEX "event_registration_event_id_idx" ON "event_registration"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "language_code_key" ON "language"("code");

-- CreateIndex
CREATE INDEX "language_code_idx" ON "language"("code");

-- CreateIndex
CREATE INDEX "matching_group_event_id_idx" ON "matching_group"("event_id");

-- CreateIndex
CREATE INDEX "matching_group_language_matching_group_id_idx" ON "matching_group_language"("matching_group_id");

-- CreateIndex
CREATE INDEX "matching_group_member_event_registration_id_idx" ON "matching_group_member"("event_registration_id");

-- AddForeignKey
ALTER TABLE "event_registration" ADD CONSTRAINT "event_registration_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registration_language" ADD CONSTRAINT "event_registration_language_event_registration_id_fkey" FOREIGN KEY ("event_registration_id") REFERENCES "event_registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_group" ADD CONSTRAINT "matching_group_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_group_language" ADD CONSTRAINT "matching_group_language_matching_group_id_fkey" FOREIGN KEY ("matching_group_id") REFERENCES "matching_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_group_member" ADD CONSTRAINT "matching_group_member_matching_group_id_fkey" FOREIGN KEY ("matching_group_id") REFERENCES "matching_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matching_group_member" ADD CONSTRAINT "matching_group_member_event_registration_id_fkey" FOREIGN KEY ("event_registration_id") REFERENCES "event_registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
