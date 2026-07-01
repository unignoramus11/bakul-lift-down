/* eslint-disable jsx-a11y/alt-text */
// The PDF document. Dark surveillance-ops aesthetic, rendered client-side with
// @react-pdf/renderer (built-in Helvetica/Courier — no external font loading,
// so it's robust on Vercel with no backend). Colors are the design tokens.

import {
  Document,
  Image,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatDateKey, parseDateKey } from "../time";
import type { ReportModel } from "./model";

const C = {
  bg: "#05070A",
  panel: "#101923",
  panel2: "#172331",
  border: "#243240",
  text: "#F5F7FA",
  text2: "#B3C1CF",
  muted: "#6D7C8D",
  disabled: "#475564",
  down: "#FF4D67",
  up: "#44D17A",
  info: "#4FD8FF",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    color: C.text2,
    paddingTop: 34,
    paddingBottom: 44,
    paddingHorizontal: 34,
    fontFamily: "Helvetica",
    fontSize: 9,
  },
  headRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontFamily: "Helvetica-Bold", fontSize: 15, color: C.text, letterSpacing: 1 },
  subtitle: { fontFamily: "Courier", fontSize: 7.5, color: C.muted, letterSpacing: 1, marginTop: 2 },
  kicker: { fontFamily: "Courier", fontSize: 7.5, color: C.muted, letterSpacing: 1 },
  rule: { borderBottomWidth: 1, borderBottomColor: C.border, marginVertical: 10 },
  classBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 10, gap: 8 },
  metaCell: {
    width: "48%",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    padding: 8,
    backgroundColor: C.panel,
  },
  metaKey: { fontFamily: "Courier", fontSize: 7, color: C.muted, letterSpacing: 1 },
  metaVal: { fontFamily: "Courier", fontSize: 11, color: C.text, marginTop: 3 },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  statCard: {
    width: "31.5%",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    padding: 8,
    backgroundColor: C.panel,
  },
  statNum: { fontFamily: "Helvetica-Bold", fontSize: 18 },
  statLabel: { fontFamily: "Courier", fontSize: 6.8, color: C.muted, letterSpacing: 1, marginTop: 3 },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: C.text,
    letterSpacing: 1.4,
    marginTop: 16,
    marginBottom: 8,
  },
  dayChips: { flexDirection: "row", flexWrap: "wrap", gap: 3 },
  chip: {
    width: 20,
    height: 20,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  chipTxt: { fontFamily: "Courier", fontSize: 7 },
  legendRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendTxt: { fontFamily: "Courier", fontSize: 7, color: C.muted, letterSpacing: 0.5 },

  dayHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.panel2,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 10,
  },
  dayDate: { fontFamily: "Helvetica-Bold", fontSize: 10, color: C.text, letterSpacing: 0.6 },
  badge: {
    fontFamily: "Courier",
    fontSize: 7,
    letterSpacing: 1,
    borderWidth: 1,
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  entry: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  thumb: { width: 42, height: 42, borderRadius: 3, borderWidth: 1, borderColor: C.border },
  thumbFallback: {
    width: 42,
    height: 42,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  entryId: { fontFamily: "Courier", fontSize: 8, color: C.text2, letterSpacing: 0.8 },
  entryTime: { fontFamily: "Courier", fontSize: 7.5, color: C.muted },
  entryNote: { fontFamily: "Helvetica", fontSize: 8.5, color: C.text2, marginTop: 3 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 34,
    right: 34,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 6,
  },
  footTxt: { fontFamily: "Courier", fontSize: 6.8, color: C.disabled, letterSpacing: 0.8 },
  sampleTag: {
    fontFamily: "Courier",
    fontSize: 7,
    color: C.info,
    letterSpacing: 1,
    borderWidth: 1,
    borderColor: C.info,
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
});

function LogoMark() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path d="M3 7V3h4M17 3h4v4M21 17v4h-4M7 21H3v-4" stroke={C.text2} strokeWidth={1.6} />
      <Path d="M10.4 11.2 12 9.6l1.6 1.6" stroke={C.up} strokeWidth={1.4} />
      <Path d="M10.4 12.8 12 14.4l1.6-1.6" stroke={C.down} strokeWidth={1.4} />
    </Svg>
  );
}

function Footer({ generatedAt }: { generatedAt: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footTxt}>BAKUL LIFT DOWN · CROWD-SOURCED SENSOR LOG</Text>
      <Text style={s.footTxt}>ALL TIMES IST · {generatedAt}</Text>
      <Text
        style={s.footTxt}
        render={({ pageNumber, totalPages }) =>
          `PAGE ${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

function statusColor(status: string) {
  if (status === "DOWN") return C.down;
  if (status === "OPERATIONAL") return C.up;
  return C.disabled;
}

export function ReportPdf({
  model,
  thumbs,
  generatedAt,
  sample,
}: {
  model: ReportModel;
  thumbs: Record<string, string>;
  generatedAt: string;
  sample: boolean;
}) {
  const { stats, days, incidentDays } = model;

  return (
    <Document
      title={`Bakul Lift Down — ${stats.from} to ${stats.to}`}
      author="BAKUL LIFT DOWN"
    >
      {/* ── Cover / summary ─────────────────────────────────────────── */}
      <Page size="A4" style={s.page} wrap>
        <View style={s.headRow}>
          <View style={s.brand}>
            <LogoMark />
            <View>
              <Text style={s.title}>BAKUL LIFT DOWN</Text>
              <Text style={s.subtitle}>BAKUL HOSTEL · IIIT HYDERABAD · LIFT-01</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <Text style={s.kicker}>INCIDENT DIGEST</Text>
            {sample ? <Text style={s.sampleTag}>SAMPLE DATA</Text> : null}
          </View>
        </View>

        <View style={s.rule} />

        <View style={s.classBar}>
          <Text style={s.kicker}>SURVEILLANCE SHIFT LOG</Text>
          <Text style={s.kicker}>
            {formatDateKey(stats.from)} → {formatDateKey(stats.to)}
          </Text>
        </View>

        <View style={s.metaGrid}>
          <MetaCell k="REPORTING PERIOD" v={`${stats.totalDays} DAYS`} />
          <MetaCell k="DAYS OBSERVED" v={`${stats.observedDays}`} />
          <MetaCell k="GENERATED" v={generatedAt} />
          <MetaCell k="TOTAL FIELD REPORTS" v={`${stats.totalReports}`} />
        </View>

        <Text style={s.sectionTitle}>SUMMARY</Text>
        <View style={s.statsRow}>
          <StatCard n={`${stats.uptimePct}%`} label="OPERATIONAL UPTIME" color={C.up} />
          <StatCard n={`${stats.downDays}`} label="DAYS WITH DOWNTIME" color={C.down} />
          <StatCard n={`${stats.longestDownStreak}`} label="LONGEST OUTAGE (DAYS)" color={C.down} />
          <StatCard n={`${stats.downReports}`} label="DOWN REPORTS" color={C.down} />
          <StatCard n={`${stats.restoreReports}`} label="RESTORE REPORTS" color={C.up} />
          <StatCard n={`${stats.operationalDays}`} label="CLEAR DAYS" color={C.up} />
        </View>

        <Text style={s.sectionTitle}>DAILY STATUS MAP</Text>
        <View style={s.dayChips}>
          {days.map((d) => {
            const col = statusColor(d.status);
            return (
              <View
                key={d.dateKey}
                style={[s.chip, { borderColor: col, backgroundColor: col + "22" }]}
              >
                <Text style={[s.chipTxt, { color: col }]}>
                  {String(parseDateKey(d.dateKey).day).padStart(2, "0")}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={s.legendRow}>
          <Legend color={C.down} label="DOWN" />
          <Legend color={C.up} label="OPERATIONAL" />
          <Legend color={C.disabled} label="NO DATA / FUTURE" />
        </View>

        <Footer generatedAt={generatedAt} />
      </Page>

      {/* ── Field log ───────────────────────────────────────────────── */}
      <Page size="A4" style={s.page} wrap>
        <View style={s.headRow}>
          <Text style={s.title}>FIELD LOG</Text>
          <Text style={s.kicker}>{incidentDays.length} DAYS WITH REPORTS</Text>
        </View>
        <View style={s.rule} />

        {incidentDays.length === 0 ? (
          <Text style={{ fontFamily: "Courier", color: C.muted, marginTop: 20 }}>
            No reports filed in this period.
          </Text>
        ) : (
          incidentDays.map((d) => {
            const col = statusColor(d.status);
            return (
              <View key={d.dateKey} wrap={false}>
                <View style={s.dayHead}>
                  <Text style={s.dayDate}>{formatDateKey(d.dateKey)}</Text>
                  <Text style={[s.badge, { color: col, borderColor: col }]}>
                    {d.status} · {d.reports.length}×
                  </Text>
                </View>
                {d.reports.map((r, i) => {
                  const down = r.kind === "DOWN";
                  const col2 = down ? C.down : C.up;
                  const t = new Date(r.createdAt);
                  const hh = istHM(t);
                  const thumb = thumbs[r.id];
                  return (
                    <View key={r.id} style={s.entry} wrap={false}>
                      {thumb ? (
                        <Image src={thumb} style={s.thumb} />
                      ) : (
                        <View style={s.thumbFallback}>
                          <Text style={{ fontFamily: "Courier", fontSize: 6, color: C.muted }}>
                            NO IMG
                          </Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <Text style={s.entryId}>
                            FIELD REPORT #{String(i + 1).padStart(2, "0")}
                          </Text>
                          <Text style={s.entryTime}>{hh} IST</Text>
                        </View>
                        <Text style={[s.badge, { color: col2, borderColor: col2, alignSelf: "flex-start", marginTop: 3 }]}>
                          {down ? "DOWN → REPORTED" : "RESTORED"}
                        </Text>
                        <Text style={s.entryNote}>
                          {r.note ? r.note : "— no note attached —"}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })
        )}

        <Footer generatedAt={generatedAt} />
      </Page>
    </Document>
  );
}

function MetaCell({ k, v }: { k: string; v: string }) {
  return (
    <View style={s.metaCell}>
      <Text style={s.metaKey}>{k}</Text>
      <Text style={s.metaVal}>{v}</Text>
    </View>
  );
}
function StatCard({ n, label, color }: { n: string; label: string; color: string }) {
  return (
    <View style={s.statCard}>
      <Text style={[s.statNum, { color }]}>{n}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}
function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={s.legendItem}>
      <View style={[s.legendDot, { backgroundColor: color }]} />
      <Text style={s.legendTxt}>{label}</Text>
    </View>
  );
}

// Local IST HH:MM without pulling the whole formatter (keeps this file
// renderer-focused). Mirrors lib/time formatISTHM.
function istHM(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return parts.replace(/^24/, "00");
}
