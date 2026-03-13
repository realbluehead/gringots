export type DailyEntryType = "ingres" | "despesa";

export interface DailyEntry {
  id: string;
  data: Date;
  tipus: DailyEntryType;
  concepte: string;
  categoriaId: string | null;
  import: number;
  notes?: string;
}
