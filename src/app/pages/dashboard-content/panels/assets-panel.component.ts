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
  @Input({ required: true }) costDiari!: number;
  @Input({ required: true }) totalCostPortafoli!: number;
  @Input({ required: true }) totalValorActual!: number;
  @Input({ required: true }) totalProfitLoss!: number;
  @Input({ required: true }) totalProfitLossPercent!: number;
  @Input({ required: true }) formatCurrency!: (value: number) => string;
  @Input({ required: true }) onSpanChange!: (value: number) => void;

  spanOptions = [1, 2, 3, 4];

  getRunwayLabel(asset: AssetView): string {
    const baseDays = this.toDays(asset.costTotal);
    if (baseDays === null) {
      return "-";
    }

    if (asset.valorActual === undefined) {
      return `${baseDays} / -`;
    }

    const extraDays = this.toDays(asset.valorActual - asset.costTotal);
    return `${baseDays} / ${this.formatSignedDays(extraDays ?? 0)}`;
  }

  getTotalRunwayLabel(): string {
    const baseDays = this.toDays(this.totalCostPortafoli);
    if (baseDays === null) {
      return "-";
    }

    const extraDays = this.toDays(this.totalProfitLoss);
    return `${baseDays} / ${this.formatSignedDays(extraDays ?? 0)}`;
  }

  private toDays(value: number): number | null {
    if (this.costDiari <= 0) {
      return null;
    }

    return Math.round(value / this.costDiari);
  }

  private formatSignedDays(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
  }
}
