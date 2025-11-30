-- AddForeignKey
ALTER TABLE "trip_message" ADD CONSTRAINT "trip_message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "app_user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
