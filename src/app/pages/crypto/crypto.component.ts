import { Component, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CryptoAddress } from "../../models/crypto-address.model";
import { CryptoAddressService } from "../../services/crypto-address.service";
import { NotificationService } from "../../services/notification.service";
import { LucideAngularModule, Pencil, Trash2 } from "lucide-angular";

@Component({
  selector: "app-crypto",
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: "./crypto.component.html",
})
export class CryptoComponent {
  private cryptoAddressService = inject(CryptoAddressService);
  private notificationService = inject(NotificationService);

  // Lucide icons
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;

  // Filtres
  filtreCerca = "";
  filtreTipus = "";

  // Edició d'adreces
  addressEditant: string | null = null;
  formulariEdicio: Partial<CryptoAddress> = {};

  // Adreces del servei
  addresses = this.cryptoAddressService.obtenirTotes();

  // Tipus de criptomonedes disponibles
  tipusCrypto = ["BTC", "ADA", "ETH", "SOL", "DOT"];

  // Adreces filtrades
  addressesFiltrades = computed(() => {
    let resultats = this.addresses();

    // Filtre per adreça
    if (this.filtreCerca) {
      const cerca = this.filtreCerca.toLowerCase();
      resultats = resultats.filter((a) =>
        a.adressa.toLowerCase().includes(cerca),
      );
    }

    // Filtre per tipus
    if (this.filtreTipus) {
      const cerca = this.filtreTipus.toLowerCase();
      resultats = resultats.filter((a) =>
        a.tipus.toLowerCase().includes(cerca),
      );
    }

    return resultats;
  });

  netejarFiltres() {
    this.filtreCerca = "";
    this.filtreTipus = "";
  }

  afegirAddress() {
    const novaAddress: Partial<CryptoAddress> = {
      tipus: "BTC",
      adressa: "",
    };

    this.addressEditant = "nova";
    this.formulariEdicio = { ...novaAddress };
  }

  esborrarAddress(id: string) {
    this.notificationService.confirm(
      "Estàs segur que vols esborrar aquesta adreça?",
      () => {
        this.cryptoAddressService.esborrar(id);
        this.notificationService.success("Adreça esborrada correctament");
      },
    );
  }

  editarAddress(address: CryptoAddress) {
    this.addressEditant = address.id;
    this.formulariEdicio = { ...address };
  }

  guardarAddress() {
    if (!this.formulariEdicio.tipus || !this.formulariEdicio.adressa) {
      this.notificationService.error("Omple tots els camps obligatoris");
      return;
    }

    if (this.addressEditant === "nova") {
      this.cryptoAddressService.afegir({
        tipus: this.formulariEdicio.tipus,
        adressa: this.formulariEdicio.adressa,
      });
      this.notificationService.success("Adreça afegida correctament");
    } else if (this.addressEditant) {
      this.cryptoAddressService.actualitzar(
        this.addressEditant,
        this.formulariEdicio,
      );
      this.notificationService.success("Adreça actualitzada correctament");
    }

    this.cancelarEdicio();
  }

  cancelarEdicio() {
    this.addressEditant = null;
    this.formulariEdicio = {};
  }
}
