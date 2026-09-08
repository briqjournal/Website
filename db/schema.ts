import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const articleViews = sqliteTable("article_views", {
  slug: text("slug").primaryKey(),
  views: integer("views").notNull().default(0),
  updatedAt: integer("updated_at").notNull(),
});
