ALTER TABLE "items" ADD CONSTRAINT "items_stock_nonnegative" CHECK ("items"."current_stock" >= 0);--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_min_stock_nonnegative" CHECK ("items"."min_stock" >= 0);--> statement-breakpoint
ALTER TABLE "movements" ADD CONSTRAINT "movements_quantity_positive" CHECK ("movements"."quantity" > 0);