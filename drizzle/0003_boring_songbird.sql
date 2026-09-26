ALTER TABLE "movements" ADD COLUMN "reversal_of" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "movements" ADD CONSTRAINT "movements_reversal_of_movements_id_fk" FOREIGN KEY ("reversal_of") REFERENCES "public"."movements"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "items_category_id_idx" ON "items" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "items_location_id_idx" ON "items" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "movements_item_id_idx" ON "movements" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "movements_created_id_idx" ON "movements" USING btree ("created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "movements" ADD CONSTRAINT "movements_reversal_of_unique" UNIQUE("reversal_of");