import "dotenv/config";
import { defineConfig } from "prisma/config";

// Runtime queries go through the pg driver adapter (see src/lib/db.ts) using
// DATABASE_URL. Schema migrations, however, need a *direct* (non-pooled)
// connection — providers like Neon/Supabase expose that separately. Prefer
// DIRECT_URL for migrations, fall back to DATABASE_URL for simple setups.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
