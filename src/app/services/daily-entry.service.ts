import { Injectable, signal } from "@angular/core";
import { DailyEntry } from "../models/daily-entry.model";

@Injectable({
  providedIn: "root",
})
export class DailyEntryService {
  private readonly STORAGE_KEY = "gringots_daily_entries";
  private entries = signal<DailyEntry[]>([]);

  constructor() {
    this.carregarEntrades();
  }

  private carregarEntrades(): void {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        const entries = JSON.parse(data, (key, value) => {
          if (key === "data" && typeof value === "string") {
            return new Date(value);
          }
          return value;
        }) as DailyEntry[];
        this.entries.set(entries);
      } catch (error) {
        console.error("Error carregant el diari:", error);
        this.entries.set([]);
      }
    }
  }

  private guardarEntrades(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.entries()));
  }

  obtenirTots() {
    return this.entries.asReadonly();
  }

  afegir(entry: Omit<DailyEntry, "id">): void {
    const novaEntrada: DailyEntry = {
      ...entry,
      id: Date.now().toString(),
    };

    this.entries.update((entries) => [novaEntrada, ...entries]);
    this.guardarEntrades();
  }

  esborrar(id: string): void {
    this.entries.update((entries) => entries.filter((e) => e.id !== id));
    this.guardarEntrades();
  }

  importar(entries: DailyEntry[]): void {
    const entriesProcessades = entries.map((e) => ({
      ...e,
      data: e.data instanceof Date ? e.data : new Date(e.data),
    }));

    this.entries.set(entriesProcessades);
    this.guardarEntrades();
  }

  netejar(): void {
    this.entries.set([]);
    this.guardarEntrades();
  }
}
