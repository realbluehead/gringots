import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration } from "chart.js";

@Component({
  selector: "app-assets-pie-panel",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: "./assets-pie-panel.component.html",
})
export class AssetsPiePanelComponent {
  @Input({ required: true }) span!: number;
  @Input({ required: true }) chartData!: ChartConfiguration<"pie">["data"];
  @Input({ required: true })
  chartOptions!: ChartConfiguration<"pie">["options"];
  @Input({ required: true }) hasData!: boolean;
  @Input({ required: true }) onSpanChange!: (value: number) => void;

  spanOptions = [1, 2, 3, 4];
}
