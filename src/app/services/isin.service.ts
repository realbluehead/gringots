import { Injectable, signal } from '@angular/core';
import { Isin } from '../models/isin.model';

@Injectable({
  providedIn: 'root'
})
export class IsinService {
  private readonly STORAGE_KEY = 'gringots_isins';
  private isins = signal<Isin[]>([]);

  constructor() {
    this.carregarIsins();
  }

  private carregarIsins(): void {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        const isins = JSON.parse(data) as Isin[];
        this.isins.set(isins);
      } catch (error) {
        console.error('Error carregant ISINs:', error);
        this.isins.set([]);
      }
    }
  }

  private guardarIsins(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.isins()));
  }

  obtenirTots() {
    return this.isins.asReadonly();
  }

  obtenirPerIsin(isin: string): Isin | undefined {
    return this.isins().find(i => i.isin === isin);
  }

  afegir(isin: Isin): void {
    const nouIsin: Isin = {
      ...isin,
      id: Date.now().toString()
    };
    this.isins.update(isins => [...isins, nouIsin]);
    this.guardarIsins();
  }

  actualitzar(id: string, isinActualitzat: Partial<Isin>): void {
    this.isins.update(isins =>
      isins.map(i => i.id === id ? { ...i, ...isinActualitzat } : i)
    );
    this.guardarIsins();
  }

  esborrar(id: string): void {
    this.isins.update(isins => isins.filter(i => i.id !== id));
    this.guardarIsins();
  }

  // Mètode per importar ISINs mantenint els IDs originals
  importar(isins: Isin[]): void {
    this.isins.set(isins);
    this.guardarIsins();
  }

  // Mètode per netejar totes les dades
  netejar(): void {
    this.isins.set([]);
    this.guardarIsins();
  }
}
