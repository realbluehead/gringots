import { Injectable, signal } from "@angular/core";
import { PreciousMetal } from "../models/precious-metal.model";
import { ensureUniqueIds, generateUniqueId } from "../utils/unique-id.util";

@Injectable({
  providedIn: "root",
})
export class PreciousMetalService {
  private readonly STORAGE_KEY = "gringots_precious_metals";
  private metalls = signal<PreciousMetal[]>([]);

  constructor() {
    this.carregarMetalls();
  }

  private carregarMetalls(): void {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        const metalls = JSON.parse(data) as PreciousMetal[];
        this.metalls.set(ensureUniqueIds(metalls));
      } catch (error) {
        console.error("Error carregant metalls:", error);
        this.metalls.set([]);
      }
    }
  }

  private guardarMetalls(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.metalls()));
  }

  obtenirTots() {
    return this.metalls.asReadonly();
  }

  afegir(metall: Omit<PreciousMetal, "id">): void {
    const nouMetall: PreciousMetal = {
      ...metall,
      id: generateUniqueId(this.metalls().map((m) => m.id)),
      preuTotal: metall.preuCompra,
    };
    this.metalls.update((metalls) => [...metalls, nouMetall]);
    this.guardarMetalls();
  }

  actualitzar(id: string, metallActualitzat: Partial<PreciousMetal>): void {
    this.metalls.update((metalls) =>
      metalls.map((m) => {
        if (m.id === id) {
          const actualitzat = { ...m, ...metallActualitzat };
          actualitzat.preuTotal = actualitzat.preuCompra;
          return actualitzat;
        }
        return m;
      }),
    );
    this.guardarMetalls();
  }

  esborrar(id: string): void {
    this.metalls.update((metalls) => metalls.filter((m) => m.id !== id));
    this.guardarMetalls();
  }

  obtenirPerMetall(metall: string) {
    return this.metalls().filter((m) => m.metall === metall);
  }

  calcularTotalValor(): number {
    return this.metalls().reduce((total, m) => total + (m.preuTotal ?? 0), 0);
  }

  calcularPesTotal(): number {
    return this.metalls().reduce((total, m) => total + m.grams, 0);
  }
}
