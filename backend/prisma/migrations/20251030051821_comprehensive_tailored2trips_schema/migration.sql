/*
  Warnings:

  - You are about to drop the `Blog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "trip_visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'FRIENDS_ONLY');

-- CreateEnum
CREATE TYPE "trip_role" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "item_type" AS ENUM ('FLIGHT', 'HOTEL', 'ACTIVITY', 'RESTAURANT', 'TRANSPORT', 'FREE_TIME');

-- CreateEnum
CREATE TYPE "target_type" AS ENUM ('PLACE', 'TRIP', 'USER');

-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_authorId_fkey";

-- DropTable
DROP TABLE "Blog";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "app_user" (
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT,
    "bio" TEXT,
    "profile_photo_url" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_security" (
    "user_id" TEXT NOT NULL,
    "has_2fa" BOOLEAN NOT NULL DEFAULT false,
    "totp_secret" TEXT,
    "backup_codes_hash" TEXT[],
    "last_password_reset_at" TIMESTAMP(3),

    CONSTRAINT "user_security_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_session" (
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "user_agent" TEXT,
    "ip_addr" TEXT,

    CONSTRAINT "user_session_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "oauth_account" (
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "user_id" TEXT NOT NULL,
    "travel_styles" TEXT[],
    "interests" TEXT[],
    "budget_min" INTEGER,
    "budget_max" INTEGER,
    "home_airport" TEXT,
    "languages" TEXT[],
    "notification_email" BOOLEAN NOT NULL DEFAULT true,
    "notification_push" BOOLEAN NOT NULL DEFAULT true,
    "theme" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "place" (
    "place_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "address" TEXT,
    "city" TEXT,
    "country_code" CHAR(2),
    "external_ref" JSONB,
    "rating_avg" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "place_pkey" PRIMARY KEY ("place_id")
);

-- CreateTable
CREATE TABLE "trip" (
    "trip_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "origin_city" TEXT,
    "destination_city" TEXT,
    "visibility" "trip_visibility" NOT NULL DEFAULT 'PRIVATE',
    "total_budget_cents" INTEGER,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_pkey" PRIMARY KEY ("trip_id")
);

-- CreateTable
CREATE TABLE "trip_member" (
    "trip_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "trip_role" NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_member_pkey" PRIMARY KEY ("trip_id","user_id")
);

-- CreateTable
CREATE TABLE "itinerary_day" (
    "day_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "day_number" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "itinerary_day_pkey" PRIMARY KEY ("day_id")
);

-- CreateTable
CREATE TABLE "itinerary_item" (
    "item_id" TEXT NOT NULL,
    "day_id" TEXT NOT NULL,
    "type" "item_type" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "place_id" TEXT,
    "sort_order" INTEGER NOT NULL,
    "cost_cents" INTEGER,
    "external_booking" JSONB,
    "explainability" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itinerary_item_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "booking" (
    "booking_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_ref" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "booked_at" TIMESTAMP(3) NOT NULL,
    "confirmation_code" TEXT,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "cost_category" (
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "cost_category_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "trip_budget_line" (
    "budget_line_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "category_code" TEXT NOT NULL,
    "budget_cents" INTEGER NOT NULL,
    "spent_cents" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "trip_budget_line_pkey" PRIMARY KEY ("budget_line_id")
);

-- CreateTable
CREATE TABLE "review" (
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_type" "target_type" NOT NULL,
    "target_id" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "favorite" (
    "user_id" TEXT NOT NULL,
    "target_type" "target_type" NOT NULL,
    "target_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_pkey" PRIMARY KEY ("user_id","target_type","target_id")
);

-- CreateTable
CREATE TABLE "trip_message" (
    "message_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_message_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "notification" (
    "notification_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "weather_snapshot" (
    "snapshot_id" TEXT NOT NULL,
    "place_id" TEXT NOT NULL,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB NOT NULL,

    CONSTRAINT "weather_snapshot_pkey" PRIMARY KEY ("snapshot_id")
);

-- CreateTable
CREATE TABLE "badge" (
    "badge_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon_url" TEXT,

    CONSTRAINT "badge_pkey" PRIMARY KEY ("badge_code")
);

-- CreateTable
CREATE TABLE "user_badge" (
    "user_id" TEXT NOT NULL,
    "badge_code" TEXT NOT NULL,
    "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badge_pkey" PRIMARY KEY ("user_id","badge_code")
);

-- CreateTable
CREATE TABLE "recommendation_log" (
    "rec_id" TEXT NOT NULL,
    "user_id" TEXT,
    "trip_id" TEXT,
    "context" JSONB NOT NULL,
    "explanations" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_log_pkey" PRIMARY KEY ("rec_id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "log_id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" TEXT,
    "details" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_user_email_key" ON "app_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "app_user_username_key" ON "app_user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_account_provider_provider_user_id_key" ON "oauth_account"("provider", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "itinerary_day_trip_id_day_number_key" ON "itinerary_day"("trip_id", "day_number");

-- CreateIndex
CREATE UNIQUE INDEX "booking_item_id_key" ON "booking"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "trip_budget_line_trip_id_category_code_key" ON "trip_budget_line"("trip_id", "category_code");

-- CreateIndex
CREATE UNIQUE INDEX "review_user_id_target_type_target_id_key" ON "review"("user_id", "target_type", "target_id");

-- AddForeignKey
ALTER TABLE "user_security" ADD CONSTRAINT "user_security_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_account" ADD CONSTRAINT "oauth_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip" ADD CONSTRAINT "trip_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "app_user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_member" ADD CONSTRAINT "trip_member_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("trip_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_member" ADD CONSTRAINT "trip_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_day" ADD CONSTRAINT "itinerary_day_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("trip_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_item" ADD CONSTRAINT "itinerary_item_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "itinerary_day"("day_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_item" ADD CONSTRAINT "itinerary_item_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("place_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "itinerary_item"("item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_budget_line" ADD CONSTRAINT "trip_budget_line_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("trip_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_budget_line" ADD CONSTRAINT "trip_budget_line_category_code_fkey" FOREIGN KEY ("category_code") REFERENCES "cost_category"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_message" ADD CONSTRAINT "trip_message_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("trip_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_snapshot" ADD CONSTRAINT "weather_snapshot_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("place_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_badge_code_fkey" FOREIGN KEY ("badge_code") REFERENCES "badge"("badge_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_log" ADD CONSTRAINT "recommendation_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_log" ADD CONSTRAINT "recommendation_log_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trip"("trip_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "app_user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
