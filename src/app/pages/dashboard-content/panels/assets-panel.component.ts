import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

interface AssetView {
  isin: string;
  ticker: string;
  nom: string;
  quantitatAccions: number;
  costTotal: number;
  preuActual?: number;
  valorActual?: number;
  profitLoss?: number;
  profitLossPercent?: number;
}

@Component({
  selector: "app-assets-panel",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./assets-panel.component.html",
})
export class AssetsPanelComponent {
  @Input({ required: true }) span!: number;
  @Input({ required: true }) assets!: AssetView[];
  @Input({ required: true }) totalCostPortafoli!: number;
  @Input({ required: true }) totalValorActual!: number;
  @Input({ required: true }) totalProfitLoss!: number;
  @Input({ required: true }) totalProfitLossPercent!: number;
  @Input({ required: true }) formatCurrency!: (value: number) => string;
  @Input({ required: true }) onSpanChange!: (value: number) => void;

  spanOptions = [1, 2, 3, 4];
}
