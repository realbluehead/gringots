import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IsinsComponent } from "../isins/isins.component";
import { CryptoComponent } from "../crypto/crypto.component";

type SettingsTab = "isins" | "crypto-addresses" | "policy-ids";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [CommonModule, IsinsComponent, CryptoComponent],
  templateUrl: "./settings.component.html",
})
export class SettingsComponent {
  activeTab: SettingsTab = "isins";

  setTab(tab: SettingsTab): void {
    this.activeTab = tab;
  }

  isTabActive(tab: SettingsTab): boolean {
    return this.activeTab === tab;
  }
}
