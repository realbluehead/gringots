import { Component, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PreciousMetal } from "../../models/precious-metal.model";
import { PreciousMetalService } from "../../services/precious-metal.service";
import { NotificationService } from "../../services/notification.service";
import { LucideAngularModule, Pencil, Trash2 } from "lucide-angular";

@Component({
  selector: "app-precious-metals",
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: "./precious-metals.component.html",
})
export class PreciousMetalsComponent {
  private metalService = inject(PreciousMetalService);
  private notificationService = inject(NotificationService);

  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;

  readonly GRAMS_PER_OZ = 31.1035; // Troy Ounce

  filtreCerca = "";
  filtreMetall: string = "";

  metalEditant: string | null = null;
  formulariEdicio: Partial<PreciousMetal> = {};
  formulariEdicio_oz: number = 0;

  metalls = this.metalService.obtenirTots();

  metallsFiltrats = computed(() => {
    let resultats = this.metalls();
    if (this.filtreCerca) {
      const cerca = this.filtreCerca.toLowerCase();
      resultats = resultats.filter(
        (m) =>
          m.metall.toLowerCase().includes(cerca) ||
          m.data.includes(cerca) ||
          m.grams.toString().includes(cerca),
      );
    }
    if (this.filtreMetall) {
      resultats = resultats.filter((m) => m.metall === this.filtreMetall);
    }
    return resultats.sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
    );
  });

  metallsTotals = computed(() => {
    const filtrats = this.metallsFiltrats();
    return {
      pes: filtrats.reduce((sum, m) => sum + m.grams, 0),
      pesOz: filtrats.reduce((sum, m) => sum + m.grams, 0) / this.GRAMS_PER_OZ,
      valor: filtrats.reduce((sum, m) => sum + (m.preuTotal ?? 0), 0),
    };
  });

  netejarFiltres() {
    this.filtreCerca = "";
    this.filtreMetall = "";
  }

  afegirMetall() {
    this.metalEditant = "nou";
    this.formulariEdicio = {
      data: new Date().toISOString().split("T")[0],
      metall: "or",
      puresa: 999,
      grams: 0,
      preuCompra: 0,
      vendor: "",
      descripcio: "",
    };
    this.formulariEdicio_oz = 0;
  }

  editarMetall(metall: PreciousMetal) {
    this.metalEditant = metall.id;
    this.formulariEdicio = { ...metall };
    this.formulariEdicio_oz = metall.grams / this.GRAMS_PER_OZ;
  }

  esborrarMetall(id: string) {
    this.notificationService.confirm(
      "Estàs segur que vols esborrar aquest metall?",
      () => {
        this.metalService.esborrar(id);
        this.notificationService.success("Metall esborrat correctament");
      },
    );
  }

  cancelarEdicio() {
    this.metalEditant = null;
    this.formulariEdicio = {};
  }

  guardarMetall() {
    if (
      !this.formulariEdicio.data ||
      !this.formulariEdicio.metall ||
      !this.formulariEdicio.puresa ||
      !this.formulariEdicio.grams ||
      this.formulariEdicio.preuCompra === undefined ||
      !this.formulariEdicio.vendor?.trim() ||
      !this.formulariEdicio.descripcio?.trim()
    ) {
      this.notificationService.warning(
        "Si us plau, omple tots els camps del formulari",
      );
      return;
    }

    if (
      this.formulariEdicio.grams < 0 ||
      this.formulariEdicio.preuCompra < 0
    ) {
      this.notificationService.warning(
        "Els grams i el preu han de ser positius",
      );
      return;
    }

    if (this.metalEditant === "nou") {
      this.metalService.afegir(this.formulariEdicio as Omit<PreciousMetal, "id">);
      this.notificationService.success("Metall afegit correctament");
    } else {
      this.metalService.actualitzar(
        this.metalEditant!,
        this.formulariEdicio as Partial<PreciousMetal>,
      );
      this.notificationService.success("Metall actualitzat correctament");
    }

    this.cancelarEdicio();
  }

  getMetallLabel(metall: string): string {
    const labels: { [key: string]: string } = {
      or: "Or (Au)",
      plata: "Plata (Ag)",
      paladium: "Paladium (Pd)",
      platí: "Platí (Pt)",
    };
    return labels[metall] ?? metall;
  }

  obtenirPurosaLabel(puresa: number): string {
    return (puresa / 10).toFixed(1) + "%";
  }

  onGramsChange(grams: number | undefined): void {
    if (grams !== undefined && grams >= 0) {
      this.formulariEdicio_oz = grams / this.GRAMS_PER_OZ;
    }
  }

  onOzChange(oz: number | undefined): void {
    if (oz !== undefined && oz >= 0) {
      this.formulariEdicio.grams = oz * this.GRAMS_PER_OZ;
    }
  }
}
