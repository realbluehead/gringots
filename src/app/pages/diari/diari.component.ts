import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DailyEntryService } from "../../services/daily-entry.service";
import { CategoryService } from "../../services/category.service";
import { NotificationService } from "../../services/notification.service";
import { DailyEntryType } from "../../models/daily-entry.model";
import { DailyEntry } from "../../models/daily-entry.model";
import { Category } from "../../models/category.model";
import { LucideAngularModule, FileUp, Pencil, Trash2 } from "lucide-angular";

@Component({
  selector: "app-diari",
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: "./diari.component.html",
})
export class DiariComponent {
  private dailyEntryService = inject(DailyEntryService);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);

  categories = this.categoryService.obtenirTotes();
  entries = this.dailyEntryService.obtenirTots();

  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly FileUp = FileUp;

  filtreDataInici = this.iniciMesActual();
  filtreDataFi = this.fiMesActual();
  ordreData: "asc" | "desc" = "desc";
  mostrarModalImportacio = false;
  csvImportText = "";

  entradaEditantId: string | null = null;
  formulariEdicio: {
    dataStr: string;
    tipus: DailyEntryType;
    concepte: string;
    categoriaId: string | null;
    import: number;
    notes: string;
  } | null = null;

  formulari = {
    dataStr: this.avuiLocal(),
    tipus: "despesa" as DailyEntryType,
    concepte: "",
    categoriaId: "" as string | null,
    import: 0,
    notes: "",
  };

  get entradesFiltrades() {
    return this.entries()
      .filter((e) => {
        const data = this.toLocalDateString(new Date(e.data));
        return data >= this.filtreDataInici && data <= this.filtreDataFi;
      })
      .sort((a, b) => {
        const timeA = new Date(a.data).getTime();
        const timeB = new Date(b.data).getTime();
        return this.ordreData === "asc" ? timeA - timeB : timeB - timeA;
      });
  }

  toggleOrdreData(): void {
    this.ordreData = this.ordreData === "asc" ? "desc" : "asc";
  }

  get totalIngressosDia(): number {
    return this.entradesFiltrades
      .filter((e) => e.tipus === "ingres")
      .reduce((acc, e) => acc + e.import, 0);
  }

  get totalDespesesDia(): number {
    return this.entradesFiltrades
      .filter((e) => e.tipus === "despesa")
      .reduce((acc, e) => acc + e.import, 0);
  }

  get balancDia(): number {
    return this.totalIngressosDia - this.totalDespesesDia;
  }

  afegirEntrada(): void {
    const concepte = this.formulari.concepte.trim();

    if (!concepte || this.formulari.import <= 0) {
      this.notificationService.error("Omple el concepte i un import vàlid");
      return;
    }

    this.dailyEntryService.afegir({
      data: new Date(`${this.formulari.dataStr}T12:00:00`),
      tipus: this.formulari.tipus,
      concepte,
      categoriaId: this.formulari.categoriaId || null,
      import: this.formulari.import,
      notes: this.formulari.notes.trim() || undefined,
    });

    this.notificationService.success("Moviment afegit al diari");

    this.formulari = {
      dataStr: this.formulari.dataStr,
      tipus: "despesa",
      concepte: "",
      categoriaId: "",
      import: 0,
      notes: "",
    };
  }

  esborrarEntrada(id: string): void {
    this.notificationService.confirm(
      "Vols esborrar aquest moviment del diari?",
      () => {
        this.dailyEntryService.esborrar(id);
        this.notificationService.success("Moviment esborrat");
      },
      "Esborrar moviment",
    );
  }

  editarEntrada(entry: DailyEntry): void {
    const categoriaIdPerDefecte =
      entry.categoriaId ??
      this.buscarCategoriaPerConcepte(entry.concepte, entry.id);

    this.entradaEditantId = entry.id;
    this.formulariEdicio = {
      dataStr: this.toLocalDateString(new Date(entry.data)),
      tipus: entry.tipus,
      concepte: entry.concepte,
      categoriaId: categoriaIdPerDefecte,
      import: entry.import,
      notes: entry.notes ?? "",
    };
  }

  guardarEntrada(): void {
    if (!this.entradaEditantId || !this.formulariEdicio) {
      return;
    }

    const concepte = this.formulariEdicio.concepte.trim();
    if (!concepte || this.formulariEdicio.import <= 0) {
      this.notificationService.error("Omple el concepte i un import vàlid");
      return;
    }

    this.dailyEntryService.actualitzar(this.entradaEditantId, {
      data: new Date(`${this.formulariEdicio.dataStr}T12:00:00`),
      tipus: this.formulariEdicio.tipus,
      concepte,
      categoriaId: this.formulariEdicio.categoriaId || null,
      import: this.formulariEdicio.import,
      notes: this.formulariEdicio.notes.trim() || undefined,
    });

    this.notificationService.success("Moviment actualitzat");
    this.cancelarEdicioEntrada();
  }

  cancelarEdicioEntrada(): void {
    this.entradaEditantId = null;
    this.formulariEdicio = null;
  }

  obrirModalImportacio(): void {
    this.csvImportText = "";
    this.mostrarModalImportacio = true;
  }

  tancarModalImportacio(): void {
    this.mostrarModalImportacio = false;
  }

  importarCsv(): void {
    const text = this.csvImportText.trim();
    if (!text) {
      this.notificationService.error(
        "Enganxa el contingut CSV abans d'importar",
      );
      return;
    }

    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      this.notificationService.error("No s'han trobat files vàlides al CSV");
      return;
    }

    let importades = 0;
    let descartades = 0;

    for (const line of lines) {
      const camps = this.parseCsvLine(line);
      if (camps.length < 4) {
        descartades++;
        continue;
      }

      const dataMoviment = this.parseCsvDate(camps[0]);
      const concepte = this.normalitzarConcepte(camps[2]);
      const importOriginal = this.parseImport(camps[3]);

      if (
        !dataMoviment ||
        !concepte ||
        importOriginal === null ||
        importOriginal === 0
      ) {
        descartades++;
        continue;
      }

      this.dailyEntryService.afegir({
        data: dataMoviment,
        tipus: importOriginal < 0 ? "despesa" : "ingres",
        concepte,
        categoriaId: null,
        import: Math.abs(importOriginal),
        notes: undefined,
      });

      importades++;
    }

    if (importades === 0) {
      this.notificationService.warning(
        "No s'ha pogut importar cap fila. Revisa el format del CSV.",
      );
      return;
    }

    this.tancarModalImportacio();

    if (descartades > 0) {
      this.notificationService.success(
        `Importades ${importades} files. Descartades: ${descartades}.`,
      );
    } else {
      this.notificationService.success(
        `Importades ${importades} files del CSV`,
      );
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat("ca-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(value);
  }

  formatDateDisplay(date: Date): string {
    const data = new Date(date);
    const day = String(data.getDate()).padStart(2, "0");
    const month = String(data.getMonth() + 1).padStart(2, "0");
    const year = data.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getCategoria(id: string | null): Category | undefined {
    if (!id) return undefined;
    return this.categories().find((c) => c.id === id);
  }

  private parseCsvLine(line: string): string[] {
    const delimiter = line.includes(";") ? ";" : ",";
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (!inQuotes && char === delimiter) {
        result.push(current);
        current = "";
        continue;
      }

      current += char;
    }

    result.push(current);
    return result.map((value) => value.trim().replace(/^\uFEFF/, ""));
  }

  private parseImport(rawValue: string): number | null {
    let value = rawValue.trim().replace(/\s+/g, "").replace(/€/g, "");
    if (!value) {
      return null;
    }

    const lastComma = value.lastIndexOf(",");
    const lastDot = value.lastIndexOf(".");

    if (lastComma !== -1 && lastDot !== -1) {
      if (lastComma > lastDot) {
        value = value.replace(/\./g, "").replace(",", ".");
      } else {
        value = value.replace(/,/g, "");
      }
    } else if (lastComma !== -1) {
      value = value.replace(/\./g, "").replace(",", ".");
    } else {
      value = value.replace(/,/g, "");
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private parseCsvDate(rawValue: string): Date | null {
    const value = rawValue.trim();
    const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (!match) {
      return null;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    const parsed = new Date(year, month - 1, day, 12, 0, 0, 0);
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }

    return parsed;
  }

  private normalitzarConcepte(rawConcepte: string): string {
    // Keep only the text before the first backslash.
    let concepte = rawConcepte.split("\\")[0]?.trim() ?? "";

    // Remove the initial bank code token when it contains digits.
    concepte = concepte.replace(/^\s*\S*\d\S*\s*/, "").trim();

    // Normalize repeated spaces left after cleanup.
    return concepte.replace(/\s{2,}/g, " ");
  }

  private buscarCategoriaPerConcepte(
    concepte: string,
    excludeEntryId: string,
  ): string | null {
    const concepteNormalitzat = concepte.trim().toLocaleLowerCase();
    if (!concepteNormalitzat) {
      return null;
    }

    const trobada = this.entries().find(
      (entry) =>
        entry.id !== excludeEntryId &&
        !!entry.categoriaId &&
        entry.concepte.trim().toLocaleLowerCase() === concepteNormalitzat,
    );

    return trobada?.categoriaId ?? null;
  }

  private avuiLocal(): string {
    return this.toLocalDateString(new Date());
  }

  private iniciMesActual(): string {
    const avui = new Date();
    return this.toLocalDateString(
      new Date(avui.getFullYear(), avui.getMonth(), 1),
    );
  }

  private fiMesActual(): string {
    const avui = new Date();
    return this.toLocalDateString(
      new Date(avui.getFullYear(), avui.getMonth() + 1, 0),
    );
  }

  private toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
