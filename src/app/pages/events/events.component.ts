import { Component, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { FinancialEvent, EventType } from "../../models/financial-event.model";
import { EventsService } from "../../services/events.service";

@Component({
  selector: "app-events",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Events Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-dark-text mb-2">Events</h2>
          <p class="text-dark-muted">
            Historial de transaccions i esdeveniments del portafoli
          </p>
        </div>
        <button
          (click)="afegirEvent()"
          class="bg-primary-text hover:bg-primary-text/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Afegir Event
        </button>
      </div>

      <!-- Filtres -->
      <div class="bg-dark-card rounded-lg border border-dark-border p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Filtre ISIN -->
          <div>
            <label class="block text-sm font-medium text-dark-text mb-2">
              ISIN
            </label>
            <input
              type="text"
              [(ngModel)]="filtreIsin"
              placeholder="US0378331005"
              class="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary-text"
            />
          </div>

          <!-- Filtre Tipus Event -->
          <div>
            <label class="block text-sm font-medium text-dark-text mb-2">
              Tipus d'Event
            </label>
            <select
              [(ngModel)]="filtreTipusEvent"
              class="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-text"
            >
              <option value="">Tots</option>
              <option value="compra">Compra</option>
              <option value="venta">Venta</option>
              <option value="dividend">Dividend</option>
            </select>
          </div>

          <!-- Filtre Data Inici -->
          <div>
            <label class="block text-sm font-medium text-dark-text mb-2">
              Data Inici
            </label>
            <input
              type="date"
              [(ngModel)]="filtreDataInici"
              class="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-text"
            />
          </div>

          <!-- Filtre Data Fi -->
          <div>
            <label class="block text-sm font-medium text-dark-text mb-2">
              Data Fi
            </label>
            <input
              type="date"
              [(ngModel)]="filtreDataFi"
              class="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-text"
            />
          </div>
        </div>

        <!-- Botons Filtre -->
        <div class="flex items-center justify-between mt-4">
          <p class="text-sm text-dark-muted">
            Mostrant
            <span class="font-semibold text-dark-text">{{
              eventsFiltrats.length
            }}</span>
            de {{ events().length }} esdeveniments
          </p>
          <button
            (click)="netejarFiltres()"
            class="text-sm text-primary-text hover:text-primary-text/80 font-medium transition-colors"
          >
            Netejar Filtres
          </button>
        </div>
      </div>

      <!-- Events Table -->
      <div
        class="bg-dark-card rounded-lg border border-dark-border overflow-hidden"
      >
        @if (eventsFiltrats.length === 0) {
          <!-- Empty State -->
          <div class="text-center py-12 px-6">
            <div class="text-6xl mb-4">📋</div>
            @if (events().length === 0) {
              <p class="text-dark-muted text-lg mb-2">
                No hi ha esdeveniments encara
              </p>
              <p class="text-dark-muted text-sm mb-4">
                Clica "Afegir Event" per registrar la teva primera transacció
              </p>
            } @else {
              <p class="text-dark-muted text-lg mb-2">
                No s'han trobat esdeveniments amb aquests filtres
              </p>
              <p class="text-dark-muted text-sm mb-4">
                Prova a modificar els criteris de cerca
              </p>
            }
          </div>
        } @else {
          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-dark-bg border-b border-dark-border">
                <tr>
                  <th
                    class="text-left px-6 py-3 text-sm font-semibold text-dark-text"
                  >
                    Data
                  </th>
                  <th
                    class="text-left px-6 py-3 text-sm font-semibold text-dark-text"
                  >
                    ISIN
                  </th>
                  <th
                    class="text-left px-6 py-3 text-sm font-semibold text-dark-text"
                  >
                    Tipus
                  </th>
                  <th
                    class="text-right px-6 py-3 text-sm font-semibold text-dark-text"
                  >
                    Accions
                  </th>
                  <th
                    class="text-right px-6 py-3 text-sm font-semibold text-dark-text"
                  >
                    Preu/Acció
                  </th>
                  <th
                    class="text-right px-6 py-3 text-sm font-semibold text-dark-text"
                  >
                    Total
                  </th>
                  <th
                    class="text-center px-6 py-3 text-sm font-semibold text-dark-text"
                  >
                    Accions
                  </th>
                </tr>
              </thead>
              <tbody>
                @for (event of eventsFiltrats; track event.id) {
                  @if (eventEditant === event.id) {
                    <!-- Mode Edició -->
                    <tr class="border-b border-dark-border bg-dark-bg/80">
                      <td class="px-6 py-4">
                        <input
                          type="date"
                          [value]="getDataInputValue()"
                          (input)="setDataFromInput($any($event.target).value)"
                          class="w-full px-2 py-1 bg-dark-card border border-dark-border rounded text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-text"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <input
                          type="text"
                          [(ngModel)]="formulariEdicio.isin"
                          placeholder="ISIN"
                          class="w-full px-2 py-1 bg-dark-card border border-dark-border rounded text-dark-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-text"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <select
                          [(ngModel)]="formulariEdicio.tipusEvent"
                          class="w-full px-2 py-1 bg-dark-card border border-dark-border rounded text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-text"
                        >
                          <option value="compra">Compra</option>
                          <option value="venta">Venta</option>
                          <option value="dividend">Dividend</option>
                        </select>
                      </td>
                      <td class="px-6 py-4">
                        <input
                          type="number"
                          [(ngModel)]="formulariEdicio.numeroAccions"
                          min="0"
                          step="1"
                          class="w-full px-2 py-1 bg-dark-card border border-dark-border rounded text-dark-text text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-text"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <input
                          type="number"
                          [(ngModel)]="formulariEdicio.preuPerAccio"
                          min="0"
                          step="0.01"
                          class="w-full px-2 py-1 bg-dark-card border border-dark-border rounded text-dark-text text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-text"
                        />
                      </td>
                      <td
                        class="px-6 py-4 text-sm text-right font-semibold text-dark-text"
                      >
                        {{
                          formatCurrency(
                            (formulariEdicio.numeroAccions || 0) *
                              (formulariEdicio.preuPerAccio || 0)
                          )
                        }}
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center justify-center gap-2">
                          <button
                            (click)="guardarEvent()"
                            class="text-green-500 hover:text-green-400 transition-colors"
                            title="Guardar"
                          >
                            ✓
                          </button>
                          <button
                            (click)="cancelarEdicio()"
                            class="text-gray-500 hover:text-gray-400 transition-colors"
                            title="Cancel·lar"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @else {
                    <!-- Mode Visualització -->
                    <tr
                      class="border-b border-dark-border hover:bg-dark-bg/50 transition-colors"
                    >
                      <td class="px-6 py-4 text-sm text-dark-text">
                        {{ formatData(event.data) }}
                      </td>
                      <td class="px-6 py-4 text-sm text-dark-text font-mono">
                        {{ event.isin }}
                      </td>
                      <td class="px-6 py-4 text-sm">
                        <span
                          class="px-2 py-1 rounded-full text-xs font-medium"
                          [ngClass]="{
                            'bg-green-500/20 text-green-500':
                              event.tipusEvent === 'compra',
                            'bg-red-500/20 text-red-500':
                              event.tipusEvent === 'venta',
                            'bg-blue-500/20 text-blue-500':
                              event.tipusEvent === 'dividend',
                          }"
                        >
                          {{ capitalize(event.tipusEvent) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-right text-dark-text">
                        {{ event.numeroAccions }}
                      </td>
                      <td class="px-6 py-4 text-sm text-right text-dark-text">
                        {{ formatCurrency(event.preuPerAccio) }}
                      </td>
                      <td
                        class="px-6 py-4 text-sm text-right font-semibold text-dark-text"
                      >
                        {{ formatCurrency(event.preuTotal) }}
                      </td>
                      <td class="px-6 py-4 text-center">
                        <div class="flex items-center justify-center gap-2">
                          <button
                            (click)="editarEvent(event)"
                            class="text-blue-500 hover:text-blue-400 transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            (click)="esborrarEvent(event.id)"
                            class="text-red-500 hover:text-red-400 transition-colors"
                            title="Esborrar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

          <!-- Summary -->
          <div class="px-6 py-4 bg-dark-bg border-t border-dark-border">
            <p class="text-sm text-dark-muted">
              Total d'esdeveniments:
              <span class="font-semibold text-dark-text">{{
                eventsFiltrats.length
              }}</span>
            </p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [],
})
export class EventsComponent {
  private eventsService = inject(EventsService);

  // Filtres (propietats normals per ngModel)
  filtreIsin = "";
  filtreTipusEvent: EventType | "" = "";
  filtreDataInici = "";
  filtreDataFi = "";

  // Edició d'events
  eventEditant: string | null = null;
  formulariEdicio: Partial<FinancialEvent> = {};

  // Events del servei
  events = this.eventsService.obtenirTots();

  // Events filtrats (getter que s'executa cada vegada)
  get eventsFiltrats() {
    let resultats = this.events();

    // Filtre per ISIN
    const isinFiltre = this.filtreIsin.trim().toUpperCase();
    if (isinFiltre) {
      resultats = resultats.filter((e) => e.isin.includes(isinFiltre));
    }

    // Filtre per Tipus Event
    if (this.filtreTipusEvent) {
      resultats = resultats.filter(
        (e) => e.tipusEvent === this.filtreTipusEvent,
      );
    }

    // Filtre per Data Inici
    if (this.filtreDataInici) {
      const dataInici = new Date(this.filtreDataInici);
      resultats = resultats.filter((e) => new Date(e.data) >= dataInici);
    }

    // Filtre per Data Fi
    if (this.filtreDataFi) {
      const dataFi = new Date(this.filtreDataFi);
      dataFi.setHours(23, 59, 59, 999); // Final del dia
      resultats = resultats.filter((e) => new Date(e.data) <= dataFi);
    }

    return resultats;
  }

  netejarFiltres() {
    this.filtreIsin = "";
    this.filtreTipusEvent = "";
    this.filtreDataInici = "";
    this.filtreDataFi = "";
  }

  afegirEvent() {
    const nouEvent: FinancialEvent = {
      id: '',
      data: new Date(),
      isin: "US0000000000",
      tipusEvent: "compra",
      numeroAccions: 1,
      preuPerAccio: 100.0,
      preuTotal: 100.0,
    };
    this.eventsService.afegir(nouEvent);
  }

  esborrarEvent(id: string) {
    if (confirm('Estàs segur que vols esborrar aquest event?')) {
      this.eventsService.esborrar(id);
    }
  }

  editarEvent(event: FinancialEvent) {
    this.eventEditant = event.id;
    this.formulariEdicio = {
      data: event.data,
      isin: event.isin,
      tipusEvent: event.tipusEvent,
      numeroAccions: event.numeroAccions,
      preuPerAccio: event.preuPerAccio,
    };
  }

  getDataInputValue(): string {
    if (!this.formulariEdicio.data) return "";
    const date = new Date(this.formulariEdicio.data);
    return date.toISOString().split("T")[0];
  }

  setDataFromInput(value: string) {
    this.formulariEdicio.data = new Date(value);
  }

  guardarEvent() {
    if (!this.eventEditant) return;

    const eventId = this.eventEditant;
    const numeroAccions = this.formulariEdicio.numeroAccions || 0;
    const preuPerAccio = this.formulariEdicio.preuPerAccio || 0;

    this.eventsService.actualitzar(eventId, {
      data: this.formulariEdicio.data,
      isin: this.formulariEdicio.isin,
      tipusEvent: this.formulariEdicio.tipusEvent,
      numeroAccions: numeroAccions,
      preuPerAccio: preuPerAccio,
      preuTotal: numeroAccions * preuPerAccio,
    });

    this.cancelarEdicio();
  }

  cancelarEdicio() {
    this.eventEditant = null;
    this.formulariEdicio = {};
  }

  formatData(data: Date): string {
    return new Date(data).toLocaleDateString("ca-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat("ca-ES", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
