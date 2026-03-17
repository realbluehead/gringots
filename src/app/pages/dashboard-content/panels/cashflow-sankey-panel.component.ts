import {
  Component,
  Input,
  OnChanges,
  AfterViewInit,
  ViewChild,
  ElementRef,
  SimpleChanges,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Chart } from "chart.js";
import { SankeyController, Flow } from "chartjs-chart-sankey";

export interface SankeyDataPoint {
  from: string;
  to: string;
  flow: number;
}

Chart.register(SankeyController, Flow);

@Component({
  selector: "app-cashflow-sankey-panel",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./cashflow-sankey-panel.component.html",
})
export class CashflowSankeyPanelComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild("sankeyCanvas") canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input({ required: true }) span!: number;
  @Input({ required: true }) sankeyData!: SankeyDataPoint[];
  @Input({ required: true }) colorMap!: Record<string, string>;
  @Input({ required: true }) hasData!: boolean;
  @Input({ required: true }) onSpanChange!: (value: number) => void;

  spanOptions = [1, 2, 3];
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    if (this.hasData) {
      this.initChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["sankeyData"] || changes["colorMap"] || changes["hasData"]) {
      setTimeout(() => {
        if (this.hasData) {
          if (!this.chart) {
            this.initChart();
          } else {
            this.updateChart();
          }
        } else {
          this.chart?.destroy();
          this.chart = null;
        }
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private initChart(): void {
    if (!this.canvasRef?.nativeElement) return;
    this.chart?.destroy();
    this.chart = new Chart(this.canvasRef.nativeElement, this.buildConfig());
  }

  private updateChart(): void {
    if (!this.chart) {
      this.initChart();
      return;
    }
    (this.chart.data.datasets[0] as any).data = this.sankeyData;
    this.chart.update();
  }

  private buildConfig(): any {
    return {
      type: "sankey",
      data: {
        datasets: [
          {
            label: "Despeses",
            data: this.sankeyData,
            colorFrom: (c: any) => {
              const raw: SankeyDataPoint = c.dataset.data[c.dataIndex];
              return raw ? (this.colorMap[raw.from] ?? "#ef4444") : "#ef4444";
            },
            colorTo: (c: any) => {
              const raw: SankeyDataPoint = c.dataset.data[c.dataIndex];
              return raw ? (this.colorMap[raw.to] ?? "#6366f1") : "#6366f1";
            },
            colorMode: "gradient",
            borderWidth: 0,
            color: "#f1f5f9",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => {
                const raw: SankeyDataPoint = ctx.dataset.data[ctx.dataIndex];
                if (!raw) return "";
                const formatted = new Intl.NumberFormat("ca-ES", {
                  style: "currency",
                  currency: "EUR",
                }).format(raw.flow);
                return `${raw.from} → ${raw.to}: ${formatted}`;
              },
            },
          },
          datalabels: { display: false },
        },
      },
    };
  }
}
