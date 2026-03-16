import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration } from "chart.js";

@Component({
  selector: "app-cashflow-line-panel",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: "./cashflow-line-panel.component.html",
})
export class CashflowLinePanelComponent {
  @Input({ required: true }) span!: number;
  @Input({ required: true }) chartData!: ChartConfiguration<"line">["data"];
  @Input({ required: true })
  chartOptions!: ChartConfiguration<"line">["options"];
  @Input({ required: true }) hasData!: boolean;
  @Input({ required: true }) onSpanChange!: (value: number) => void;

  spanOptions = [1, 2, 3];
}
