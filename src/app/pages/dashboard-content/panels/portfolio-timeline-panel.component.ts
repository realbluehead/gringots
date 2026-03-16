import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration } from "chart.js";

@Component({
  selector: "app-portfolio-timeline-panel",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: "./portfolio-timeline-panel.component.html",
})
export class PortfolioTimelinePanelComponent {
  @Input({ required: true }) span!: number;
  @Input({ required: true }) periodicity!: "diari" | "setmanal" | "mensual";
  @Input({ required: true }) chartData!: ChartConfiguration<"line">["data"];
  @Input({ required: true })
  chartOptions!: ChartConfiguration<"line">["options"];
  @Input({ required: true }) hasData!: boolean;
  @Input({ required: true }) onSpanChange!: (value: number) => void;
  @Input({ required: true }) onPeriodicityChange!: (
    value: "diari" | "setmanal" | "mensual",
  ) => void;

  spanOptions = [1, 2, 3, 4];
}
