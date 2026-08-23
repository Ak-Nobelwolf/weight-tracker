import { beforeEach, describe, expect, it } from "vitest";
import { importCSV, loadLogs, saveLogs, type WeightLog } from "./storage";
import { calculateStats, editLog, upsertLog } from "./weight-log-operations";

const storage = new Map<string, string>();

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
});

class MockFileReader {
  onload: ((event: { target: { result: string } }) => void) | null = null;
  onerror: (() => void) | null = null;

  readAsText(file: File) {
    file.text().then((result) => this.onload?.({ target: { result } })).catch(() => this.onerror?.());
  }
}

Object.defineProperty(globalThis, "FileReader", { configurable: true, value: MockFileReader });

describe("weight tracker data", () => {
  beforeEach(() => storage.clear());

  it("preserves the local storage log contract", () => {
    const logs: WeightLog[] = [{ date: "2026-08-23", weight: 72.4 }];
    saveLogs(logs);
    expect(loadLogs()).toEqual(logs);
  });

  it("imports supported CSV dates and rejects invalid-only files", async () => {
    const file = new File(
      [["date,weight", "2026-08-23,72.4", "23/08/2026,72.1", "20260822,72.8", "invalid,0"].join("\n")],
      "weights.csv",
      { type: "text/csv" },
    );
    await expect(importCSV(file)).resolves.toEqual([
      { date: "2026-08-23", weight: 72.4 },
      { date: "2026-08-23", weight: 72.1 },
      { date: "2026-08-22", weight: 72.8 },
    ]);

    const invalidFile = new File(["date,weight\ninvalid,0"], "invalid.csv");
    await expect(importCSV(invalidFile)).rejects.toThrow("No valid entries found");
  });

  it("updates duplicate dates, edits entries, and calculates chronological analytics", () => {
    const logs: WeightLog[] = [
      { date: "2026-08-20", weight: 74 },
      { date: "2026-08-23", weight: 72 },
    ];
    expect(upsertLog(logs, { date: "2026-08-23", weight: 71.5 })).toEqual([
      { date: "2026-08-20", weight: 74 },
      { date: "2026-08-23", weight: 71.5 },
    ]);
    expect(editLog(logs, "2026-08-20", { date: "2026-08-23", weight: 70 })).toEqual([
      { date: "2026-08-23", weight: 70 },
    ]);
    expect(calculateStats(logs)).toEqual({ average: 73, min: 72, max: 74, first: 74, last: 72, change: -2 });
    expect(calculateStats([])).toEqual({ average: 0, min: 0, max: 0, first: 0, last: 0, change: 0 });
  });
});
