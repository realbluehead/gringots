import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CryptoAddress } from "../../models/crypto-address.model";
import { PolicyId } from "../../models/policy-id.model";
import { CryptoAddressService } from "../../services/crypto-address.service";
import { PolicyIdService } from "../../services/policy-id.service";
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
  private policyIdService = inject(PolicyIdService);
  private notificationService = inject(NotificationService);

  // Lucide icons
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;

  // Edició d'adreces
  addressEditant: string | null = null;
  formulariEdicio: Partial<CryptoAddress> = {};

  // Adreces del servei
  addresses = this.cryptoAddressService.obtenirTotes();

  // Tipus de criptomonedes disponibles
  tipusCrypto = ["BTC", "ADA", "ETH", "SOL", "DOT"];

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

  // ========== PolicyId CRUD ==========

  // Edició de PolicyIds
  policyIdEditant: string | null = null;
  formulariEdicioPolicyId: Partial<PolicyId> = {};

  // PolicyIds del servei
  policyIds = this.policyIdService.obtenirTots();

  afegirPolicyId() {
    const nouPolicyId: Partial<PolicyId> = {
      policyId: "",
    };

    this.policyIdEditant = "nova";
    this.formulariEdicioPolicyId = { ...nouPolicyId };
  }

  esborrarPolicyId(id: string) {
    this.notificationService.confirm(
      "Estàs segur que vols esborrar aquest Policy ID?",
      () => {
        this.policyIdService.esborrar(id);
        this.notificationService.success("Policy ID esborrat correctament");
      },
    );
  }

  editarPolicyId(policyId: PolicyId) {
    this.policyIdEditant = policyId.id;
    this.formulariEdicioPolicyId = { ...policyId };
  }

  guardarPolicyId() {
    if (!this.formulariEdicioPolicyId.policyId) {
      this.notificationService.error("Omple el camp Policy ID");
      return;
    }

    if (this.policyIdEditant === "nova") {
      this.policyIdService.afegir({
        policyId: this.formulariEdicioPolicyId.policyId,
      });
      this.notificationService.success("Policy ID afegit correctament");
    } else if (this.policyIdEditant) {
      this.policyIdService.actualitzar(
        this.policyIdEditant,
        this.formulariEdicioPolicyId,
      );
      this.notificationService.success("Policy ID actualitzat correctament");
    }

    this.cancelarEdicioPolicyId();
  }

  cancelarEdicioPolicyId() {
    this.policyIdEditant = null;
    this.formulariEdicioPolicyId = {};
  }
}
