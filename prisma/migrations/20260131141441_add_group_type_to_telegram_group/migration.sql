-- AlterTable
ALTER TABLE "telegram_group" ADD COLUMN "group_type" VARCHAR(50);

-- CreateIndex
CREATE INDEX "telegram_group_event_id_group_type_idx" ON "telegram_group"("event_id", "group_type");
