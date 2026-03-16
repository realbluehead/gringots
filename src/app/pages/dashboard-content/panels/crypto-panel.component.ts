import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

interface CryptoGroup {
  policyId: string;
  assetName: string;
  count: number;
}

@Component({
  selector: "app-crypto-panel",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./crypto-panel.component.html",
})
export class CryptoPanelComponent {
  @Input({ required: true }) span!: number;
  @Input({ required: true }) groups!: CryptoGroup[];
  @Input({ required: true }) onSpanChange!: (value: number) => void;

  spanOptions = [1, 2, 3, 4];
}
