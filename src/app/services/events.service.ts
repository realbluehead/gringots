import { Injectable, signal } from '@angular/core';
import { FinancialEvent } from '../models/financial-event.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private readonly STORAGE_KEY = 'gringots_events';
  private events = signal<FinancialEvent[]>([]);

  constructor() {
    this.carregarEvents();
  }

  private carregarEvents(): void {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        const events = JSON.parse(data, (key, value) => {
          // Convert data strings back to Date objects
          if (key === 'data' && typeof value === 'string') {
            return new Date(value);
          }
          return value;
        }) as FinancialEvent[];
        this.events.set(events);
      } catch (error) {
        console.error('Error carregant Events:', error);
        this.events.set([]);
      }
    }
  }

  private guardarEvents(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.events()));
  }

  obtenirTots() {
    return this.events.asReadonly();
  }

  afegir(event: FinancialEvent): void {
    const nouEvent: FinancialEvent = {
      ...event,
      id: Date.now().toString()
    };
    this.events.update(events => [nouEvent, ...events]);
    this.guardarEvents();
  }

  actualitzar(id: string, eventActualitzat: Partial<FinancialEvent>): void {
    this.events.update(events =>
      events.map(e => e.id === id ? { ...e, ...eventActualitzat } : e)
    );
    this.guardarEvents();
  }

  esborrar(id: string): void {
    this.events.update(events => events.filter(e => e.id !== id));
    this.guardarEvents();
  }

  // Mètode per importar events mantenint els IDs originals
  importar(events: FinancialEvent[]): void {
    // Convert data strings to Date objects if needed
    const eventsProcessats = events.map(e => ({
      ...e,
      data: e.data instanceof Date ? e.data : new Date(e.data)
    }));
    this.events.set(eventsProcessats);
    this.guardarEvents();
  }

  // Mètode per netejar totes les dades
  netejar(): void {
    this.events.set([]);
    this.guardarEvents();
  }
}
