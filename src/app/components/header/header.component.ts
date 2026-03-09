import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ExportImportService } from "../../services/export-import.service";
import { LucideAngularModule, Download, Upload } from "lucide-angular";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: "./header.component.html",
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
