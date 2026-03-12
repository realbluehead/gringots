import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DailyEntryService } from "../../services/daily-entry.service";
import { CategoryService } from "../../services/category.service";
import { NotificationService } from "../../services/notification.service";
import { DailyEntryType } from "../../models/daily-entry.model";

@Component({
  selector: "app-diari",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./diari.component.html",
})
export class DiariComponent {
  private dailyEntryService = inject(DailyEntryService);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);

  categories = this.categoryService.obtenirTotes();
  entries = this.dailyEntryService.obtenirTots();

  filtreData = this.avuiLocal();

  formulari = {
    dataStr: this.avuiLocal(),
    tipus: "despesa" as DailyEntryType,
    concepte: "",
    categoria: "",
    import: 0,
    notes: "",
  };

  get entradesDelDia() {
    return this.entries()
      .filter(
        (e) => this.toLocalDateString(new Date(e.data)) === this.filtreData,
      )
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }

  get totalIngressosDia(): number {
    return this.entradesDelDia
      .filter((e) => e.tipus === "ingres")
      .reduce((acc, e) => acc + e.import, 0);
  }

  get totalDespesesDia(): number {
    return this.entradesDelDia
      .filter((e) => e.tipus === "despesa")
      .reduce((acc, e) => acc + e.import, 0);
  }

  get balancDia(): number {
    return this.totalIngressosDia - this.totalDespesesDia;
  }

  afegirEntrada(): void {
    const concepte = this.formulari.concepte.trim();
    const categoria = this.formulari.categoria.trim();

    if (!concepte || !categoria || this.formulari.import <= 0) {
      this.notificationService.error(
        "Omple concepte, categoria i un import vàlid",
      );
      return;
    }

    this.dailyEntryService.afegir({
      data: new Date(`${this.formulari.dataStr}T12:00:00`),
      tipus: this.formulari.tipus,
      concepte,
      categoria,
      import: this.formulari.import,
      notes: this.formulari.notes.trim() || undefined,
    });

    this.notificationService.success("Moviment afegit al diari");

    this.formulari = {
      dataStr: this.formulari.dataStr,
      tipus: "despesa",
      concepte: "",
      categoria: "",
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat("ca-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(value);
  }

  getCategoriaColor(nom: string): string | null {
    const cat = this.categories().find((c) => c.nom === nom);
    return cat ? cat.color : null;
  }

  private avuiLocal(): string {
    return this.toLocalDateString(new Date());
  }

  private toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
