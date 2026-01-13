-- AlterTable
ALTER TABLE "event_registration" ADD COLUMN     "telegram_group_id" TEXT;

-- CreateTable
CREATE TABLE "telegram_group" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "telegram_chat_id" VARCHAR(255),
    "invite_link" VARCHAR(500),
    "member_count" INTEGER NOT NULL DEFAULT 0,
    "max_members" INTEGER NOT NULL DEFAULT 5,
    "is_full" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_group_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "telegram_group_event_id_idx" ON "telegram_group"("event_id");

-- CreateIndex
CREATE INDEX "telegram_group_is_full_idx" ON "telegram_group"("is_full");

-- CreateIndex
CREATE INDEX "event_registration_telegram_group_id_idx" ON "event_registration"("telegram_group_id");

-- AddForeignKey
ALTER TABLE "event_registration" ADD CONSTRAINT "event_registration_telegram_group_id_fkey" FOREIGN KEY ("telegram_group_id") REFERENCES "telegram_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_group" ADD CONSTRAINT "telegram_group_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
