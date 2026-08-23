import type { WeightLog } from "./storage";

export interface WeightLogStats {
  average: number;
  min: number;
  max: number;
  first: number;
  last: number;
  change: number;
}

export const upsertLog = (logs: WeightLog[], nextLog: WeightLog): WeightLog[] => {
  const existingIndex = logs.findIndex((log) => log.date === nextLog.date);
  if (existingIndex < 0) return [...logs, nextLog];

  const updated = [...logs];
  updated[existingIndex] = nextLog;
  return updated;
};

export const editLog = (logs: WeightLog[], oldDate: string, nextLog: WeightLog): WeightLog[] =>
  upsertLog(logs.filter((log) => log.date !== oldDate), nextLog);

export const removeLog = (logs: WeightLog[], date: string): WeightLog[] =>
  logs.filter((log) => log.date !== date);

export const calculateStats = (logs: WeightLog[]): WeightLogStats => {
  if (logs.length === 0) {
    return { average: 0, min: 0, max: 0, first: 0, last: 0, change: 0 };
  }

  const weights = logs.map((log) => log.weight);
  const sortedByDate = [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const average = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
  const first = sortedByDate[0].weight;
  const last = sortedByDate[sortedByDate.length - 1].weight;

  return { average, min: Math.min(...weights), max: Math.max(...weights), first, last, change: last - first };
};
