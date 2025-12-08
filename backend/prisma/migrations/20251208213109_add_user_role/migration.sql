-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "app_user" ADD COLUMN     "role" "user_role" NOT NULL DEFAULT 'USER';
