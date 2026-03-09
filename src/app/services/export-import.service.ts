import { Injectable, inject } from "@angular/core";
import { IsinService } from "./isin.service";
import { EventsService } from "./events.service";
import { NotificationService } from "./notification.service";
import { Isin } from "../models/isin.model";
import { FinancialEvent } from "../models/financial-event.model";

export interface GringotsExport {
  version: string;
  exportDate: string;
  data: {
    isins: Isin[];
    events: FinancialEvent[];
  };
}

@Injectable({
  providedIn: "root",
})
export class ExportImportService {
  private isinService = inject(IsinService);
  private eventsService = inject(EventsService);
  private notificationService = inject(NotificationService);
  private readonly VERSION = "1.0";

  exportarDades(): void {
    const exportData: GringotsExport = {
      version: this.VERSION,
      exportDate: new Date().toISOString(),
      data: {
        isins: this.isinService.obtenirTots()(),
        events: this.eventsService.obtenirTots()(),
      },
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    // Create download link with date and time
    const now = new Date();
    const timestamp = now
      .toISOString()
      .replace("T", "-")
      .replace(/:/g, "-")
      .split(".")[0]; // Format: YYYY-MM-DD-HH-MM-SS

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gringots-backup-${timestamp}.json`;
    link.click();

    // Cleanup
    URL.revokeObjectURL(url);

    // Show success notification
    this.notificationService.success("Dades exportades correctament!");
  }

  importarDades(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importData: GringotsExport = JSON.parse(content);

          // Validate format
          if (!importData.version || !importData.data) {
            throw new Error("Format de fitxer invàlid");
          }

          // Confirm before overwriting
          const confirmMsg =
            `Això sobreescriurà totes les dades actuals.\n\n` +
            `ISINs: ${importData.data.isins.length}\n` +
            `Events: ${importData.data.events.length}\n\n` +
            `Estàs segur?`;

          this.notificationService.confirm(confirmMsg, () => {
            // Import data maintaining original IDs
            this.isinService.importar(importData.data.isins);
            this.eventsService.importar(importData.data.events);
            this.notificationService.success("Dades importades correctament!");
          });

          resolve();
        } catch (error) {
          console.error("Error important dades:", error);
          reject(error);
          this.notificationService.error(
            "Error important el fitxer. Comprova que sigui un fitxer vàlid de Gringots.",
          );
        }
      };

      reader.onerror = () => {
        reject(new Error("Error llegint el fitxer"));
      };

      reader.readAsText(file);
    });
  }
}
