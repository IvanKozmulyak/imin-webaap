-- CreateTable
CREATE TABLE IF NOT EXISTS "conversation_message" (
    "id" TEXT NOT NULL,
    "chat_id" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sequence" INTEGER NOT NULL,

    CONSTRAINT "conversation_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "conversation_message_chat_id_sequence_idx" ON "conversation_message"("chat_id", "sequence");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "conversation_message_chat_id_created_at_idx" ON "conversation_message"("chat_id", "created_at");
