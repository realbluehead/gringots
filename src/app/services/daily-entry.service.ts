import { Injectable, signal } from "@angular/core";
import { DailyEntry } from "../models/daily-entry.model";
import { ensureUniqueIds, generateUniqueId } from "../utils/unique-id.util";

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
        this.entries.set(ensureUniqueIds(entries));
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
      id: generateUniqueId(this.entries().map((e) => e.id)),
    };

    this.entries.update((entries) => [novaEntrada, ...entries]);
    this.guardarEntrades();
  }

  actualitzar(
    id: string,
    entryActualitzada: Partial<Omit<DailyEntry, "id">>,
  ): void {
    this.entries.update((entries) => {
      const index = entries.findIndex((e) => e.id === id);
      if (index === -1) {
        return entries;
      }

      const actualitzades = [...entries];
      actualitzades[index] = { ...actualitzades[index], ...entryActualitzada };
      return actualitzades;
    });
    this.guardarEntrades();
  }

  esborrar(id: string): void {
    this.entries.update((entries) => {
      const index = entries.findIndex((e) => e.id === id);
      if (index === -1) {
        return entries;
      }

      const actualitzades = [...entries];
      actualitzades.splice(index, 1);
      return actualitzades;
    });
    this.guardarEntrades();
  }

  importar(entries: (DailyEntry & { categoria?: string })[]): void {
    const entriesProcessades: DailyEntry[] = entries.map((e) => {
      // Backward compat: old format stored `categoria` as text – drop it
      const { categoria: _old, ...rest } = e as DailyEntry & {
        categoria?: string;
      };
      return {
        ...rest,
        categoriaId: rest.categoriaId ?? null,
        data:
          rest.data instanceof Date
            ? rest.data
            : new Date(rest.data as unknown as string),
      };
    });

    this.entries.set(ensureUniqueIds(entriesProcessades));
    this.guardarEntrades();
  }

  netejar(): void {
    this.entries.set([]);
    this.guardarEntrades();
  }
}
