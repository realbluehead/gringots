export type DailyEntryType = "ingres" | "despesa";

export interface DailyEntry {
  id: string;
  data: Date;
  tipus: DailyEntryType;
  concepte: string;
  categoria: string;
  import: number;
  notes?: string;
}
