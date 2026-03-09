import { Component, computed, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Isin } from "../../models/isin.model";
import { IsinService } from "../../services/isin.service";
import { NotificationService } from "../../services/notification.service";
import { LucideAngularModule, Pencil, Trash2 } from "lucide-angular";

@Component({
  selector: "app-isins",
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: "./isins.component.html",
})
export class IsinsComponent {
  private isinService = inject(IsinService);
  private notificationService = inject(NotificationService);

  // Lucide icons
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;

  // Filtres
  filtreCerca = "";
  filtreNom = "";
  filtreTicker = "";

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
      resultats = resultats.filter((i) => i.isin.toLowerCase().includes(cerca));
    }

    // Filtre per Nom
    if (this.filtreNom) {
      const cerca = this.filtreNom.toLowerCase();
      resultats = resultats.filter((i) => i.nom.toLowerCase().includes(cerca));
    }

    // Filtre per Ticker
    if (this.filtreTicker) {
      const cerca = this.filtreTicker.toLowerCase();
      resultats = resultats.filter((i) =>
        i.ticker.toLowerCase().includes(cerca),
      );
    }

    return resultats;
  });

  netejarFiltres() {
    this.filtreCerca = "";
    this.filtreNom = "";
    this.filtreTicker = "";
  }

  afegirIsin() {
    const nouIsin: Isin = {
      id: "",
      isin: "",
      nom: "",
      ticker: "",
    };

    this.isinEditant = "nou";
    this.formulariEdicio = { ...nouIsin };
  }

  esborrarIsin(id: string) {
    this.notificationService.confirm(
      "Estàs segur que vols esborrar aquest ISIN?",
      () => {
        this.isinService.esborrar(id);
        this.notificationService.success("ISIN esborrat correctament");
      },
    );
  }

  editarIsin(isin: Isin) {
    this.isinEditant = isin.id;
    this.formulariEdicio = { ...isin };
  }

  guardarIsin() {
    if (
      !this.formulariEdicio.isin ||
      !this.formulariEdicio.nom ||
      !this.formulariEdicio.ticker
    ) {
      this.notificationService.warning("Si us plau, omple tots els camps");
      return;
    }

    if (this.isinEditant === "nou") {
      // Crear nou ISIN
      this.isinService.afegir(this.formulariEdicio as Isin);
      this.notificationService.success("ISIN creat correctament");
    } else if (this.isinEditant) {
      // Actualitzar ISIN existent
      this.isinService.actualitzar(this.isinEditant, this.formulariEdicio);
      this.notificationService.success("ISIN actualitzat correctament");
    }

    this.cancelarEdicio();
  }

  cancelarEdicio() {
    this.isinEditant = null;
    this.formulariEdicio = {};
  }
}
