import { PrismaPg } from "@prisma/adapter-pg";

// Builds the pg driver adapter with SSL configured explicitly instead of via
// the connection string's `sslmode`. Recent `pg` versions print a deprecation
// warning when they see `sslmode=require|prefer|verify-ca` (they currently
// treat those as `verify-full`). We reproduce that behavior here and drop the
// param so the warning never fires — no need to edit the URL.
export function makePgAdapter(connectionString: string): PrismaPg {
  let cs = connectionString;
  let ssl: false | { rejectUnauthorized: boolean } | undefined;

  try {
    const u = new URL(connectionString);
    const mode = u.searchParams.get("sslmode");
    if (mode) {
      u.searchParams.delete("sslmode");
      cs = u.toString();
      if (mode === "disable") ssl = false;
      else if (mode === "no-verify") ssl = { rejectUnauthorized: false };
      else ssl = { rejectUnauthorized: true }; // require/prefer/verify-* → verify-full
    }
  } catch {
    /* not a parseable URL — hand it to pg untouched */
  }

  return ssl === undefined
    ? new PrismaPg({ connectionString: cs })
    : new PrismaPg({ connectionString: cs, ssl });
}
