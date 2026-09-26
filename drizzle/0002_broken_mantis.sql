CREATE TABLE "locations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "locations_name_unique" UNIQUE("name")
);--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "location_id" uuid;--> statement-breakpoint
INSERT INTO "locations" ("name")
SELECT DISTINCT btrim("location") FROM "items" WHERE btrim("location") <> '';--> statement-breakpoint
UPDATE "items" AS item
SET "location_id" = location.id
FROM "locations" AS location
WHERE location.name = btrim(item."location");--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;
