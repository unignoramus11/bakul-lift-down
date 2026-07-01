/**
 * Deletes ALL reports from the database pointed at by DATABASE_URL.
 *
 *   npm run db:clear
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { makePgAdapter } from "../src/lib/pgAdapter";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");
  const prisma = new PrismaClient({ adapter: makePgAdapter(connectionString) });

  const { count } = await prisma.report.deleteMany({});
  console.log(`Cleared ${count} reports. Database is now empty.`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
