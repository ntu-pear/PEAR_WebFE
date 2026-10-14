import type { OpsLog } from "@/api/logger/opsLogs";
import { describeOpsLog, levelBadgeClass, mergeTrace, statusBadgeClass } from "./formatOpsLog";

const line = (over: Partial<OpsLog>): OpsLog => ({
  timestamp: "2026-10-14T01:00:00.000Z",
  ops_type: "request",
  message: "msg",
  ...over,
});

describe("mergeTrace", () => {
  it("merges lists oldest first", () => {
    const a = line({ timestamp: "2026-10-14T01:00:02.000Z", message: "third" });
    const b = line({ timestamp: "2026-10-14T01:00:00.000Z", message: "first" });
    const c = line({ timestamp: "2026-10-14T01:00:01.000Z", message: "second" });
    expect(mergeTrace([[a], [b, c], []]).map((l) => l.message)).toEqual(["first", "second", "third"]);
  });

  it("keeps lines with an unparsable timestamp instead of crashing", () => {
    const bad = line({ timestamp: "not a date", message: "bad" });
    expect(mergeTrace([[line({})], [bad]])).toHaveLength(2);
  });
});

describe("describeOpsLog", () => {
  it("request: method, path and masked query", () => {
    expect(describeOpsLog(line({ method: "GET", path: "/api/v1/patients/1", query: "mask=false" }))).toBe(
      "GET /api/v1/patients/1?mask=false"
    );
  });

  it("auth: event and reason", () => {
    expect(describeOpsLog(line({ ops_type: "auth", event: "login_failed", reason: "wrong_password" }))).toBe(
      "login_failed: wrong_password"
    );
    expect(describeOpsLog(line({ ops_type: "auth", event: "http_401" }))).toBe("http_401");
  });

  it("error: exception type and message", () => {
    expect(describeOpsLog(line({ ops_type: "error", exception_type: "KeyError", message: "boom" }))).toBe(
      "KeyError: boom"
    );
    expect(describeOpsLog(line({ ops_type: "error", message: "db failed" }))).toBe("db failed");
  });

  it("falls back to the message for a request line without method or path", () => {
    expect(describeOpsLog(line({ message: "GET /x -> 200" }))).toBe("GET /x -> 200");
  });
});

describe("badges", () => {
  it.each([
    [503, "red"],
    [404, "amber"],
    [302, "blue"],
    [200, "green"],
    [null, "gray"],
  ])("status %s is %s", (status, colour) => {
    expect(statusBadgeClass(status as number | null)).toContain(colour);
  });

  it.each([
    ["ERROR", "red"],
    ["critical", "red"],
    ["WARNING", "amber"],
    ["INFO", "gray"],
    [undefined, "gray"],
  ])("level %s is %s", (level, colour) => {
    expect(levelBadgeClass(level)).toContain(colour);
  });
});
