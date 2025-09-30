CREATE TABLE "colleges" (
	"college_id" serial PRIMARY KEY NOT NULL,
	"college_name" varchar(255) NOT NULL,
	"location" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"course_id" serial PRIMARY KEY NOT NULL,
	"course_name" varchar(255) NOT NULL,
	"fee" numeric(10, 2) NOT NULL,
	"college_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorite_colleges" (
	"user_id" integer NOT NULL,
	"college_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_colleges_user_id_college_id_pk" PRIMARY KEY("user_id","college_id")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"review_id" serial PRIMARY KEY NOT NULL,
	"rating" integer NOT NULL,
	"comment" varchar(1000) NOT NULL,
	"college_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_college_id_user_id_unique" UNIQUE("college_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_college_id_colleges_college_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("college_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_colleges" ADD CONSTRAINT "favorite_colleges_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_colleges" ADD CONSTRAINT "favorite_colleges_college_id_colleges_college_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("college_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_college_id_colleges_college_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("college_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;