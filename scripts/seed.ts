/**
 * Seeds ~2.5 months of coherent mock reports into the database pointed at by
 * DATABASE_URL. Models real incident behaviour: mostly-clear days, same-day
 * outages (DOWN → RESTORED), and multi-day outages that stay DOWN until
 * restored. Images are real small grayscale JPEGs (a stylised lift frame).
 *
 * Skips today (so you can test uploads on a clean day) and only clears prior
 * historical rows, leaving today's/future rows untouched.
 *
 *   npm run db:seed
 */
import "dotenv/config";
import sharp from "sharp";
import { PrismaClient } from "../src/generated/prisma/client";
import { makePgAdapter } from "../src/lib/pgAdapter";
import { dateKeyIST } from "../src/lib/time";

const NDAYS = 76; // days of history before today (> 2 months)

// ── deterministic RNG ────────────────────────────────────────────────────────
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(0xba4011f7);
const pick = <T>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const pad = (n: number) => String(n).padStart(2, "0");

const NOTES_DOWN = [
  "stuck between 2 and 3, doors won't open",
  "no response on any floor, panel dark",
  "grinding noise then dead stop",
  "doors keep re-opening, won't move",
  "trapped ~5 min, alarm silent",
  "cabin stuck at ground, button unlit",
  "jerks hard between floors",
  null,
  null,
];
const NOTES_UP = [
  "back online, tested up and down",
  "technician left, running normally",
  "restored, doors smooth again",
  "reset done, working now",
  null,
  null,
];

// ── image ────────────────────────────────────────────────────────────────────
function liftSvg(floor: number, timeLabel: string, tone: number): string {
  const w = 560;
  const h = 420;
  const g1 = 40 + tone;
  const g2 = 18 + tone;
  const seam = w / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgb(${g1},${g1+ 6},${g1 + 10})"/>
      <stop offset="1" stop-color="rgb(${g2},${g2 + 4},${g2 + 7})"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <!-- door frame -->
  <rect x="70" y="40" width="${w - 140}" height="${h - 80}" fill="none" stroke="rgba(200,210,220,0.18)" stroke-width="6"/>
  <!-- door leaves + seam -->
  <rect x="76" y="46" width="${seam - 80}" height="${h - 92}" fill="rgba(120,132,146,0.10)"/>
  <rect x="${seam + 4}" y="46" width="${seam - 80}" height="${h - 92}" fill="rgba(120,132,146,0.07)"/>
  <line x1="${seam}" y1="46" x2="${seam}" y2="${h - 46}" stroke="rgba(10,12,16,0.5)" stroke-width="3"/>
  <!-- brushed lines -->
  ${Array.from({ length: 16 })
    .map(
      (_, i) =>
        `<line x1="80" y1="${60 + i * 20}" x2="${w - 80}" y2="${60 + i * 20}" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>`,
    )
    .join("")}
  <!-- floor indicator -->
  <rect x="${seam - 34}" y="70" width="68" height="40" rx="4" fill="rgba(8,10,14,0.7)" stroke="rgba(180,190,200,0.25)"/>
  <text x="${seam}" y="99" font-family="monospace" font-size="26" fill="rgba(210,220,230,0.85)" text-anchor="middle">${floor}</text>
  <!-- CCTV burn-in -->
  <text x="16" y="${h - 16}" font-family="monospace" font-size="15" fill="rgba(220,228,236,0.75)">BAKUL LIFT  ${timeLabel}</text>
</svg>`;
}

async function makePhoto(floor: number, timeLabel: string): Promise<{ dataUrl: string; bytes: number }> {
  const tone = Math.floor(rnd() * 26);
  const svg = liftSvg(floor, timeLabel, tone);
  let quality = 46;
  let buf = await sharp(Buffer.from(svg)).grayscale().jpeg({ quality, mozjpeg: true }).toBuffer();
  // squeeze under the 20 KB budget if needed
  while (buf.length > 20 * 1024 && quality > 20) {
    quality -= 6;
    buf = await sharp(Buffer.from(svg)).grayscale().jpeg({ quality, mozjpeg: true }).toBuffer();
  }
  return { dataUrl: `data:image/jpeg;base64,${buf.toString("base64")}`, bytes: buf.length };
}

// ── report builder ───────────────────────────────────────────────────────────
type Draft = {
  kind: "DOWN" | "RESTORED";
  imageData: string;
  imageMime: string;
  imageBytes: number;
  note: string | null;
  dateKey: string;
  createdAt: Date;
};

function utcFromIST(key: string, hh: number, mm: number): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh - 5, mm - 30));
}

async function draft(
  key: string,
  hh: number,
  mm: number,
  kind: "DOWN" | "RESTORED",
): Promise<Draft> {
  const floor = 1 + Math.floor(rnd() * 5);
  const timeLabel = `${pad(hh)}:${pad(mm)}`;
  const photo = await makePhoto(floor, timeLabel);
  return {
    kind,
    imageData: photo.dataUrl,
    imageMime: "image/jpeg",
    imageBytes: photo.bytes,
    note: kind === "DOWN" ? pick(NOTES_DOWN) : pick(NOTES_UP),
    dateKey: key,
    createdAt: utcFromIST(key, hh, mm),
  };
}

async function main() {
  const todayKey = dateKeyIST(new Date());
  const [ty, tm, td] = todayKey.split("-").map(Number);

  // sequential IST day-keys, oldest → yesterday
  const keys: string[] = [];
  for (let i = NDAYS; i >= 1; i--) {
    const base = new Date(Date.UTC(ty, tm - 1, td - i, 7, 30)); // mid-day IST
    const key = dateKeyIST(base);
    if (key === "2026-07-01" || key === todayKey) continue; // never seed today
    keys.push(key);
  }

  const drafts: Draft[] = [];
  let ongoing = false; // an outage carried from a previous day

  for (const key of keys) {
    const times: number[] = [];
    const nextTime = () => {
      const hh = 7 + Math.floor(rnd() * 15); // 07..21
      const mm = Math.floor(rnd() * 60);
      const t = hh * 60 + mm;
      times.push(t);
      return { hh, mm };
    };

    if (ongoing) {
      // continue or resolve the outage
      if (rnd() < 0.55) {
        // resolve today: maybe a re-confirm DOWN, then a RESTORED later
        if (rnd() < 0.4) {
          const a = nextTime();
          drafts.push(await draft(key, a.hh, a.mm, "DOWN"));
        }
        const b = nextTime();
        drafts.push(await draft(key, Math.max(b.hh, 12), b.mm, "RESTORED"));
        ongoing = false;
      } else {
        const n = 1 + Math.floor(rnd() * 2);
        for (let i = 0; i < n; i++) {
          const a = nextTime();
          drafts.push(await draft(key, a.hh, a.mm, "DOWN"));
        }
      }
    } else if (rnd() < 0.26) {
      // new incident starts
      if (rnd() < 0.62) {
        // same-day outage: 1-3 DOWN then RESTORED
        const n = 1 + Math.floor(rnd() * 3);
        for (let i = 0; i < n; i++) {
          const a = nextTime();
          drafts.push(await draft(key, a.hh, a.mm, "DOWN"));
        }
        const b = nextTime();
        drafts.push(await draft(key, Math.max(b.hh, 13), b.mm, "RESTORED"));
      } else {
        // outage that carries into following days
        const n = 1 + Math.floor(rnd() * 2);
        for (let i = 0; i < n; i++) {
          const a = nextTime();
          drafts.push(await draft(key, a.hh, a.mm, "DOWN"));
        }
        ongoing = true;
      }
    }
    // else: clear day (no reports)
  }

  // sort chronologically for tidy insertion
  drafts.sort((a, b) => +a.createdAt - +b.createdAt);

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");
  const prisma = new PrismaClient({ adapter: makePgAdapter(connectionString) });

  // clear only historical rows; leave today/future intact
  const del = await prisma.report.deleteMany({ where: { dateKey: { lt: todayKey } } });

  // insert in batches
  const B = 40;
  for (let i = 0; i < drafts.length; i += B) {
    await prisma.report.createMany({ data: drafts.slice(i, i + B) });
  }

  const downs = drafts.filter((d) => d.kind === "DOWN").length;
  const avgKb = drafts.length
    ? (drafts.reduce((s, d) => s + d.imageBytes, 0) / drafts.length / 1024).toFixed(1)
    : "0";

  console.log(
    `Seeded ${drafts.length} reports (${downs} DOWN, ${drafts.length - downs} RESTORED) ` +
      `across ${keys.length} days [${keys[0]} → ${keys[keys.length - 1]}]. ` +
      `Cleared ${del.count} old rows. Avg image ${avgKb} KB. Today (${todayKey}) left empty.`,
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
