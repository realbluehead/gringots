import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Isin } from '../../models/isin.model';
import { IsinService } from '../../services/isin.service';

@Component({
  selector: 'app-isins',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- ISINs Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-dark-text mb-2">Gestió d'ISINs</h2>
          <p class="text-dark-muted">
            Gestiona els identificadors de valors del teu portafoli
          </p>
        </div>
        <button
          (click)="afegirIsin()"
          class="bg-primary-text hover:bg-primary-text/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Afegir ISIN
        </button>
      </div>

      <!-- Search Filter -->
      <div class="bg-dark-card rounded-lg border border-dark-border p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-dark-text mb-2">
              Cercar ISIN
            </label>
            <input
              type="text"
              [(ngModel)]="filtreCerca"
              placeholder="US0378331005"
              class="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary-text"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-dark-text mb-2">
              Cercar Nom
            </label>
            <input
              type="text"
              [(ngModel)]="filtreNom"
              placeholder="Apple Inc."
              class="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary-text"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-dark-text mb-2">
              Cercar Ticker
            </label>
            <input
              type="text"
              [(ngModel)]="filtreTicker"
              placeholder="AAPL"
              class="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary-text"
            />
          </div>
        </div>

        <div class="flex items-center justify-between mt-4">
          <p class="text-sm text-dark-muted">
            Mostrant
            <span class="font-semibold text-dark-text">{{ isinsFiltrats().length }}</span>
            de {{ isins().length }} ISINs
          </p>
          <button
            (click)="netejarFiltres()"
            class="text-sm text-primary-text hover:text-primary-text/80 font-medium transition-colors"
          >
            Netejar Filtres
          </button>
        </div>
      </div>

      <!-- ISINs Table -->
      <div class="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
        @if (isinsFiltrats().length === 0 && isinEditant !== 'nou') {
          <!-- Empty State -->
          <div class="text-center py-12 px-6">
            <div class="text-6xl mb-4">📊</div>
            @if (isins().length === 0) {
              <p class="text-dark-muted text-lg mb-2">
                No hi ha ISINs registrats encara
              </p>
              <p class="text-dark-muted text-sm mb-4">
                Clica "Afegir ISIN" per registrar el teu primer valor
              </p>
            } @else {
              <p class="text-dark-muted text-lg mb-2">
                No s'han trobat ISINs amb aquests filtres
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
                  <th class="text-left px-6 py-3 text-sm font-semibold text-dark-text">
                    ISIN
                  </th>
                  <th class="text-left px-6 py-3 text-sm font-semibold text-dark-text">
                    Nom
                  </th>
                  <th class="text-left px-6 py-3 text-sm font-semibold text-dark-text">
                    Ticker
                  </th>
                  <th class="text-center px-6 py-3 text-sm font-semibold text-dark-text">
                    Accions
                  </th>
                </tr>
              </thead>
              <tbody>
                @if (isinEditant === 'nou') {
                  <!-- Formulari Nou ISIN -->
                  <tr class="border-b border-dark-border bg-dark-bg/80">
                    <td class="px-6 py-4">
                      <input
                        type="text"
                        [(ngModel)]="formulariEdicio.isin"
                        placeholder="US0378331005"
                        class="w-full px-2 py-1 bg-dark-card border border-dark-border rounded text-dark-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-text"
                        maxlength="12"
                      />
                    </td>
                    <td class="px-6 py-4">
                      <input
                        type="text"
                        [(ngModel)]="formulariEdicio.nom"
                        placeholder="Apple Inc."
                        class="w-full px-2 py-1 bg-dark-card border border-dark-border rounded text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-text"
                      />
                    </td>
                    <td class="px-6 py-4">
                      <input
                        type="text"
                        [(ngModel)]="formulariEdicio.ticker"
                        placeholder="AAPL"
                        class="w-full px-2 py-1 bg-dark-card border border-dark-border rounded text-dark-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-text"
                        maxlength="10"
                      />
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-center gap-2">
                        <button
                          (click)="guardarIsin()"
                          class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Guardar
                        </button>
                        <button
                          (click)="cancelarEdicio()"
                          class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Cancel·lar
                        </button>
                      </div>
                    </td>
                  </tr>
                }
                @for (isin of isinsFiltrats(); track isin.id) {
                  @if (isinEditant === isin.id) {
                    <!-- Mode Edició -->
                    <tr class="border-b border-dark-border bg-dark-bg/80">
                      <td class="px-6 py-4">
                        <input
                          type="text"
                          [(ngModel)]="formulariEdicio.isin"
                          placeholder="US0378331005"
                          class="w-full px-2 py-1 bg-dark-card border border-dark-border rounded text-dark-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-text"
                          maxlength="12"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <input
                          type="text"
                          [(ngModel)]="formulariEdicio.nom"
                          placeholder="Apple Inc."
                          class="w-full px-2 py-1 bg-dark-card border border-dark-border rounded text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-text"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <input
                          type="text"
                          [(ngModel)]="formulariEdicio.ticker"
                          placeholder="AAPL"
                          class="w-full px-2 py-1 bg-dark-card border border-dark-border rounded text-dark-text text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-text"
                          maxlength="10"
                        />
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center justify-center gap-2">
                          <button
                            (click)="guardarIsin()"
                            class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Guardar
                          </button>
                          <button
                            (click)="cancelarEdicio()"
                            class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Cancel·lar
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @else {
                    <!-- Mode Visualització -->
                    <tr class="border-b border-dark-border hover:bg-dark-bg/50 transition-colors">
                      <td class="px-6 py-4">
                        <span class="font-mono text-sm text-dark-text">{{ isin.isin }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-sm text-dark-text">{{ isin.nom }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="font-mono text-sm text-dark-text">{{ isin.ticker }}</span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center justify-center gap-2">
                          <button
                            (click)="editarIsin(isin)"
                            class="text-blue-500 hover:text-blue-400 px-3 py-1 rounded transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            (click)="esborrarIsin(isin.id)"
                            class="text-red-500 hover:text-red-400 px-3 py-1 rounded transition-colors"
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
              Total d'ISINs:
              <span class="font-semibold text-dark-text">{{ isinsFiltrats().length }}</span>
            </p>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class IsinsComponent {
  private isinService = inject(IsinService);

  // Filtres
  filtreCerca = '';
  filtreNom = '';
  filtreTicker = '';

  // Edició d'ISINs
  isinEditant: string | null = null;
  formulariEdicio: Partial<Isin> = {};

  // ISINs del servei
  isins = this.isinService.obtenirTots();

  // ISINs filtrats
  isinsFiltrats = computed(() => {
    let resultats = this.isins();

    // Filtre per ISIN
    if (this.filtreCerca) {
      const cerca = this.filtreCerca.toLowerCase();
      resultats = resultats.filter(i => i.isin.toLowerCase().includes(cerca));
    }

    // Filtre per Nom
    if (this.filtreNom) {
      const cerca = this.filtreNom.toLowerCase();
      resultats = resultats.filter(i => i.nom.toLowerCase().includes(cerca));
    }

    // Filtre per Ticker
    if (this.filtreTicker) {
      const cerca = this.filtreTicker.toLowerCase();
      resultats = resultats.filter(i => i.ticker.toLowerCase().includes(cerca));
    }

    return resultats;
  });

  netejarFiltres() {
    this.filtreCerca = '';
    this.filtreNom = '';
    this.filtreTicker = '';
  }

  afegirIsin() {
    const nouIsin: Isin = {
      id: '',
      isin: '',
      nom: '',
      ticker: ''
    };
    
    this.isinEditant = 'nou';
    this.formulariEdicio = { ...nouIsin };
  }

  esborrarIsin(id: string) {
    if (confirm('Estàs segur que vols esborrar aquest ISIN?')) {
      this.isinService.esborrar(id);
    }
  }

  editarIsin(isin: Isin) {
    this.isinEditant = isin.id;
    this.formulariEdicio = { ...isin };
  }

  guardarIsin() {
    if (!this.formulariEdicio.isin || !this.formulariEdicio.nom || !this.formulariEdicio.ticker) {
      alert('Si us plau, omple tots els camps');
      return;
    }

    if (this.isinEditant === 'nou') {
      // Crear nou ISIN
      this.isinService.afegir(this.formulariEdicio as Isin);
    } else if (this.isinEditant) {
      // Actualitzar ISIN existent
      this.isinService.actualitzar(this.isinEditant, this.formulariEdicio);
    }

    this.cancelarEdicio();
  }

  cancelarEdicio() {
    this.isinEditant = null;
    this.formulariEdicio = {};
  }
}
