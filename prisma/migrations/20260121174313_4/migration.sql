/*
  Warnings:

  - You are about to drop the column `telegram` on the `event_registration` table. All the data in the column will be lost.
  - Added the required column `city` to the `event_registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sex` to the `event_registration` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "event_registration_telegram_key";

-- AlterTable
ALTER TABLE "event_registration" DROP COLUMN "telegram",
ADD COLUMN     "city" VARCHAR(255),
ADD COLUMN     "sex" VARCHAR(50);
