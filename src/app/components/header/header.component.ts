import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ExportImportService } from "../../services/export-import.service";
import { LucideAngularModule, Download, Upload } from "lucide-angular";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <header class="bg-dark-card border-b border-dark-border">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="text-3xl">🏦</div>
            <div>
              <h1 class="text-2xl font-bold text-dark-text">Gringots</h1>
              <p class="text-sm text-dark-muted">
                Gestor de Portafoli Personal
              </p>
            </div>
          </div>

          <div class="flex items-center gap-8">
            <!-- Navigation Menu -->
            <nav class="flex items-center space-x-6">
              <a
                routerLink="/dashboard"
                routerLinkActive="text-primary-text border-b-2 border-primary-text"
                class="text-dark-muted hover:text-dark-text transition-colors pb-1 font-medium"
              >
                Dashboard
              </a>
              <a
                routerLink="/events"
                routerLinkActive="text-primary-text border-b-2 border-primary-text"
                class="text-dark-muted hover:text-dark-text transition-colors pb-1 font-medium"
              >
                Events
              </a>
              <a
                routerLink="/isins"
                routerLinkActive="text-primary-text border-b-2 border-primary-text"
                class="text-dark-muted hover:text-dark-text transition-colors pb-1 font-medium"
              >
                ISINs
              </a>
            </nav>

            <!-- Export/Import Buttons -->
            <div class="flex items-center gap-2">
              <button
                (click)="exportar()"
                class="flex items-center gap-2 px-3 py-1.5 bg-dark-bg hover:bg-dark-bg/80 border border-dark-border rounded-lg text-dark-text text-sm font-medium transition-colors"
                title="Exportar dades"
              >
                <lucide-angular
                  [img]="Download"
                  [size]="16"
                  class="text-white"
                ></lucide-angular>
                <span>Exportar</span>
              </button>
              <button
                (click)="fileInput.click()"
                class="flex items-center gap-2 px-3 py-1.5 bg-dark-bg hover:bg-dark-bg/80 border border-dark-border rounded-lg text-dark-text text-sm font-medium transition-colors"
                title="Importar dades"
              >
                <lucide-angular
                  [img]="Upload"
                  [size]="16"
                  class="text-white"
                ></lucide-angular>
                <span>Importar</span>
              </button>
              <input
                #fileInput
                type="file"
                accept=".json"
                (change)="importar($event)"
                class="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [],
})
export class HeaderComponent {
  private exportImportService = inject(ExportImportService);

  // Lucide icons
  readonly Download = Download;
  readonly Upload = Upload;

  exportar(): void {
    this.exportImportService.exportarDades();
  }

  importar(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.exportImportService
        .importarDades(file)
        .then(() => {
          // Reset input so the same file can be selected again
          input.value = "";
        })
        .catch((error) => {
          console.error("Error important:", error);
          input.value = "";
        });
    }
  }
}
