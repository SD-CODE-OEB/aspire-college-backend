ALTER TABLE "reviews" DROP CONSTRAINT "reviews_college_id_colleges_college_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_college_id_colleges_college_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("college_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;