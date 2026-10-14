import { bucketStarts, buildCountSeries, buildTraffic, flagLink, formatBucket, OTHER_SERVICE, sgtDate } from "./formatLogStats";

const NOW = new Date("2026-10-14T05:30:00.000Z"); // 13:30 SGT

describe("formatLogStats", () => {
  it("lists 25 hourly buckets for 24h and SGT-midnight day buckets otherwise", () => {
    const hours = bucketStarts("24h", NOW);
    expect(hours).toHaveLength(25);
    expect(new Date(hours[24]).toISOString()).toBe("2026-10-14T05:00:00.000Z");
    const days = bucketStarts("7d", NOW);
    expect(days).toHaveLength(8);
    expect(new Date(days[7]).toISOString()).toBe("2026-10-13T16:00:00.000Z");
  });

  it("formats buckets and dates in Singapore time", () => {
    expect(formatBucket("2026-10-14T01:00:00.000Z", "24h")).toBe("09:00");
    expect(formatBucket("2026-10-13T16:00:00.000Z", "7d")).toBe("14 Oct");
    expect(sgtDate("2026-10-13T20:00:00.000Z")).toBe("2026-10-14");
    expect(sgtDate("nope")).toBeNull();
  });

  it("fills quiet buckets with zero and folds small services into other", () => {
    const traffic = ["a", "b", "c", "d", "e", "f"].map((service, i) => ({
      t: "2026-10-14T03:00:00.000Z",
      service,
      requests: 60 - i * 10,
      errors: 1,
    }));
    const result = buildTraffic(traffic, "24h", NOW);
    expect(result.services).toEqual(["a", "b", "c", "d", OTHER_SERVICE]);
    expect(result.rows).toHaveLength(25);
    const busy = result.rows.find((row) => row.t === Date.parse("2026-10-14T03:00:00.000Z"))!;
    expect(busy[OTHER_SERVICE]).toBe(20 + 10);
    expect(busy.errors).toBe(6);
    expect(result.totalRequests).toBe(210);
    expect(result.peak?.requests).toBe(210);
    expect(result.rows.filter((row) => row.total === 0)).toHaveLength(24);
  });

  it("keeps up to four services without an other series", () => {
    const traffic = ["a", "b", "c", "d"].map((service) => ({ t: "2026-10-14T03:00:00.000Z", service, requests: 1, errors: 0 }));
    expect(buildTraffic(traffic, "24h", NOW).services).toEqual(["a", "b", "c", "d"]);
  });

  it("sums counts into bucket rows", () => {
    const rows = buildCountSeries([{ t: "2026-10-12T16:00:00.000Z", count: 4 }], "7d", NOW);
    expect(rows).toHaveLength(8);
    expect(rows.find((row) => row.count === 4)?.t).toBe(Date.parse("2026-10-12T16:00:00.000Z"));
  });

  it("maps link hints to admin pages", () => {
    expect(flagLink("sensitive", "2026-10-14T01:00:00.000Z")).toBe("/admin/ops-logs/sensitive?date=2026-10-14");
    expect(flagLink("system", "2026-10-14T01:00:00.000Z")).toBe("/admin/system-config-logs");
    expect(flagLink("activity", "2026-10-14T01:00:00.000Z")).toBeNull();
  });
});
