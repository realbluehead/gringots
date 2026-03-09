import { Component, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { FinancialEvent, EventType } from "../../models/financial-event.model";
import { EventsService } from "../../services/events.service";
import { NotificationService } from "../../services/notification.service";
import { IsinService } from "../../services/isin.service";
import {
  LucideAngularModule,
  RefreshCw,
  ClipboardList,
  Check,
  X,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-angular";

@Component({
  selector: "app-events",
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: "./events.component.html",
})
export class EventsComponent {
  private eventsService = inject(EventsService);
  private notificationService = inject(NotificationService);
  private isinService = inject(IsinService);

  // Lucide icons
  readonly RefreshCw = RefreshCw;
  readonly ClipboardList = ClipboardList;
  readonly Check = Check;
  readonly X = X;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly ChevronUp = ChevronUp;
  readonly ChevronDown = ChevronDown;

  // Ordenació
  columnaOrdenacio: keyof FinancialEvent | "" = "data";
  direccioOrdenacio: "asc" | "desc" = "desc";

  // Filtres (propietats normals per ngModel)
  filtreIsin = "";
  filtreTipusEvent: EventType | "" = "";
  filtreDataInici = "";
  filtreDataFi = "";

  // Edició d'events
  eventEditant: string | null = null;
  formulariEdicio: Partial<FinancialEvent> = {};

  // Nou event
  mostrarDialegNouEvent = false;
  formulariNouEvent: {
    dataStr: string;
    isin: string;
    tipusEvent: EventType;
    numeroAccions: number;
    preuPerAccio: number;
    preuTotal: number;
  } = {
    dataStr: new Date().toISOString().split("T")[0],
    isin: "",
    tipusEvent: "compra",
    numeroAccions: 1,
    preuPerAccio: 0,
    preuTotal: 0,
  };

  // Events del servei
  events = this.eventsService.obtenirTots();

  // ISINs del servei
  isins = this.isinService.obtenirTots();

  // Events filtrats (getter que s'executa cada vegada)
  get eventsFiltrats() {
    let resultats = this.events();

    // Filtre per ISIN
    if (this.filtreIsin) {
      resultats = resultats.filter((e) => e.isin === this.filtreIsin);
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

    // Ordenació
    if (this.columnaOrdenacio) {
      resultats = [...resultats].sort((a, b) => {
        let valorA: any = a[this.columnaOrdenacio as keyof FinancialEvent];
        let valorB: any = b[this.columnaOrdenacio as keyof FinancialEvent];

        // Tractament especial per dates
        if (this.columnaOrdenacio === "data") {
          valorA = new Date(valorA).getTime();
          valorB = new Date(valorB).getTime();
        }

        // Ordenació
        if (valorA < valorB) {
          return this.direccioOrdenacio === "asc" ? -1 : 1;
        }
        if (valorA > valorB) {
          return this.direccioOrdenacio === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return resultats;
  }

  ordenarPer(columna: keyof FinancialEvent) {
    if (this.columnaOrdenacio === columna) {
      // Canviar direcció
      this.direccioOrdenacio =
        this.direccioOrdenacio === "asc" ? "desc" : "asc";
    } else {
      // Nova columna
      this.columnaOrdenacio = columna;
      this.direccioOrdenacio = "asc";
    }
  }

  netejarFiltres() {
    this.filtreIsin = "";
    this.filtreTipusEvent = "";
    this.filtreDataInici = "";
    this.filtreDataFi = "";
  }

  afegirEvent() {
    this.formulariNouEvent = {
      dataStr: new Date().toISOString().split("T")[0],
      isin: "",
      tipusEvent: "compra",
      numeroAccions: 1,
      preuPerAccio: 0,
      preuTotal: 0,
    };
    this.mostrarDialegNouEvent = true;
  }

  calcularTotal() {
    this.formulariNouEvent.preuTotal =
      this.formulariNouEvent.numeroAccions *
      this.formulariNouEvent.preuPerAccio;
  }

  guardarNouEvent() {
    if (!this.formulariNouEvent.isin) {
      this.notificationService.error("Selecciona un ISIN");
      return;
    }

    const nouEvent: FinancialEvent = {
      id: "",
      data: new Date(this.formulariNouEvent.dataStr),
      isin: this.formulariNouEvent.isin,
      tipusEvent: this.formulariNouEvent.tipusEvent,
      numeroAccions: this.formulariNouEvent.numeroAccions,
      preuPerAccio: this.formulariNouEvent.preuPerAccio,
      preuTotal: this.formulariNouEvent.preuTotal,
    };

    this.eventsService.afegir(nouEvent);
    this.notificationService.success("Event afegit correctament");
    this.mostrarDialegNouEvent = false;
  }

  cancelarNouEvent() {
    this.mostrarDialegNouEvent = false;
  }

  esborrarEvent(id: string) {
    this.notificationService.confirm(
      "Estàs segur que vols esborrar aquest event?",
      () => {
        this.eventsService.esborrar(id);
        this.notificationService.success("Event esborrat correctament");
      },
    );
  }

  editarEvent(event: FinancialEvent) {
    this.eventEditant = event.id;
    this.formulariEdicio = {
      data: event.data,
      isin: event.isin,
      tipusEvent: event.tipusEvent,
      numeroAccions: event.numeroAccions,
      preuPerAccio: event.preuPerAccio,
      preuTotal: event.preuTotal,
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

    this.eventsService.actualitzar(eventId, {
      data: this.formulariEdicio.data,
      isin: this.formulariEdicio.isin,
      tipusEvent: this.formulariEdicio.tipusEvent,
      numeroAccions: this.formulariEdicio.numeroAccions,
      preuPerAccio: this.formulariEdicio.preuPerAccio,
      preuTotal: this.formulariEdicio.preuTotal,
    });

    this.notificationService.success("Event actualitzat correctament");
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

  obtenirDescripcioIsin(isinCode: string): string {
    const isin = this.isins().find((i) => i.isin === isinCode);
    if (isin) {
      return `${isin.ticker}: ${isin.nom}`;
    }
    return "Desconegut";
  }
}
