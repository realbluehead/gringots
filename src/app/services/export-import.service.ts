import { Injectable, inject } from "@angular/core";
import { IsinService } from "./isin.service";
import { EventsService } from "./events.service";
import { CryptoAddressService } from "./crypto-address.service";
import { PolicyIdService } from "./policy-id.service";
import { DailyEntryService } from "./daily-entry.service";
import { NotificationService } from "./notification.service";
import { Isin } from "../models/isin.model";
import { FinancialEvent } from "../models/financial-event.model";
import { CryptoAddress } from "../models/crypto-address.model";
import { PolicyId } from "../models/policy-id.model";
import { DailyEntry } from "../models/daily-entry.model";

export interface GringotsExport {
  version: string;
  exportDate: string;
  data: {
    isins: Isin[];
    events: FinancialEvent[];
    cryptoAddresses: CryptoAddress[];
    policyIds: PolicyId[];
    dailyEntries?: DailyEntry[];
  };
}

@Injectable({
  providedIn: "root",
})
export class ExportImportService {
  private isinService = inject(IsinService);
  private eventsService = inject(EventsService);
  private cryptoAddressService = inject(CryptoAddressService);
  private policyIdService = inject(PolicyIdService);
  private dailyEntryService = inject(DailyEntryService);
  private notificationService = inject(NotificationService);
  private readonly VERSION = "1.0";

  exportarDades(): void {
    const exportData: GringotsExport = {
      version: this.VERSION,
      exportDate: new Date().toISOString(),
      data: {
        isins: this.isinService.obtenirTots()(),
        events: this.eventsService.obtenirTots()(),
        cryptoAddresses: this.cryptoAddressService.obtenirTotes()(),
        policyIds: this.policyIdService.obtenirTots()(),
        dailyEntries: this.dailyEntryService.obtenirTots()(),
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
            `Events: ${importData.data.events.length}\n` +
            `Adreces Crypto: ${importData.data.cryptoAddresses?.length || 0}\n` +
            `Policy IDs: ${importData.data.policyIds?.length || 0}\n` +
            `Moviments Diari: ${importData.data.dailyEntries?.length || 0}\n\n` +
            `Estàs segur?`;

          this.notificationService.confirm(confirmMsg, () => {
            // Import data maintaining original IDs
            this.isinService.importar(importData.data.isins);
            this.eventsService.importar(importData.data.events);

            // Import crypto data (with backward compatibility)
            if (importData.data.cryptoAddresses) {
              this.cryptoAddressService.importar(
                importData.data.cryptoAddresses,
              );
            }
            if (importData.data.policyIds) {
              this.policyIdService.importar(importData.data.policyIds);
            }

            // Import daily entries (with backward compatibility)
            if (importData.data.dailyEntries) {
              this.dailyEntryService.importar(importData.data.dailyEntries);
            } else {
              this.dailyEntryService.netejar();
            }

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
