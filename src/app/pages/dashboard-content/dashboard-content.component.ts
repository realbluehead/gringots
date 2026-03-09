import { Component, inject, OnInit, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { EventsService } from "../../services/events.service";
import { IsinService } from "../../services/isin.service";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration } from "chart.js";

interface Asset {
  isin: string;
  ticker: string;
  nom: string;
  quantitatAccions: number;
  costTotal: number;
}

@Component({
  selector: "app-dashboard-content",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  template: `
    <div class="space-y-6">
      <!-- Dashboard Header -->
      <div>
        <h2 class="text-2xl font-bold text-dark-text mb-2">Dashboard</h2>
      </div>

      <!-- Assets Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Assets Table Card -->
        <div class="bg-dark-card rounded-lg border border-dark-border p-6">
          <h3 class="text-xl font-semibold text-dark-text mb-4">Assets</h3>

          @if (assets().length === 0) {
            <p class="text-dark-muted text-center py-8">
              No tens cap actiu al portafoli
            </p>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="border-b border-dark-border">
                  <tr>
                    <th
                      class="text-left px-4 py-3 text-sm font-semibold text-dark-text"
                    >
                      ISIN
                    </th>
                    <th
                      class="text-left px-4 py-3 text-sm font-semibold text-dark-text"
                    >
                      Actiu
                    </th>
                    <th
                      class="text-right px-4 py-3 text-sm font-semibold text-dark-text"
                    >
                      Accions
                    </th>
                    <th
                      class="text-right px-4 py-3 text-sm font-semibold text-dark-text"
                    >
                      Cost Total
                    </th>
                    <th
                      class="text-right px-4 py-3 text-sm font-semibold text-dark-text"
                    >
                      Cost Mitjà
                    </th>
                  </tr>
                </thead>
                <tbody>
                  @for (asset of assets(); track asset.isin) {
                    <tr
                      class="border-b border-dark-border/50 hover:bg-dark-bg/50 transition-colors"
                    >
                      <td class="px-4 py-3 text-sm text-dark-text font-mono">
                        {{ asset.isin }}
                      </td>
                      <td class="px-4 py-3 text-sm text-dark-text">
                        <div class="font-medium">{{ asset.ticker }}</div>
                        <div class="text-xs text-dark-muted">
                          {{ asset.nom }}
                        </div>
                      </td>
                      <td class="px-4 py-3 text-sm text-right text-dark-text">
                        {{ asset.quantitatAccions }}
                      </td>
                      <td
                        class="px-4 py-3 text-sm text-right font-semibold text-dark-text"
                      >
                        {{ formatCurrency(asset.costTotal) }}
                      </td>
                      <td class="px-4 py-3 text-sm text-right text-dark-muted">
                        {{
                          formatCurrency(
                            asset.costTotal / asset.quantitatAccions
                          )
                        }}
                      </td>
                    </tr>
                  }
                </tbody>
                <tfoot class="border-t-2 border-dark-border">
                  <tr>
                    <td
                      colspan="3"
                      class="px-4 py-3 text-sm font-semibold text-dark-text text-right"
                    >
                      Total:
                    </td>
                    <td
                      class="px-4 py-3 text-sm text-right font-bold text-primary-text"
                    >
                      {{ formatCurrency(totalCostPortafoli()) }}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          }
        </div>

        <!-- Assets Distribution Chart Card -->
        @if (assets().length > 0) {
          <div class="bg-dark-card rounded-lg border border-dark-border p-6">
            <h3 class="text-xl font-semibold text-dark-text mb-4">
              Distribució d'actius
            </h3>
            <div class="flex justify-center items-center" style="height: 500px">
              <canvas
                baseChart
                [data]="pieChartData()"
                [options]="pieChartOptions"
                [type]="'pie'"
              >
              </canvas>
            </div>
          </div>
        }
      </div>

      <!-- Runway Section -->
      <div class="bg-dark-card rounded-lg border border-dark-border p-6">
        <h3 class="text-xl font-semibold text-dark-text mb-4">Runway</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Estalvis Input -->
          <div>
            <label
              for="estalvis"
              class="block text-sm font-medium text-dark-text mb-2"
            >
              Estalvis (€)
            </label>
            <input
              type="number"
              id="estalvis"
              [(ngModel)]="estalvis"
              (ngModelChange)="calculateRunway()"
              placeholder="0.00"
              class="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-text"
            />
          </div>

          <!-- Cost Diari Input -->
          <div>
            <label
              for="costDiari"
              class="block text-sm font-medium text-dark-text mb-2"
            >
              Cost diari (€)
            </label>
            <input
              type="number"
              id="costDiari"
              [(ngModel)]="costDiari"
              (ngModelChange)="calculateRunway()"
              placeholder="0.00"
              class="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-text"
            />
          </div>

          <!-- Runway Result -->
          <div>
            <label class="block text-sm font-medium text-dark-text mb-2">
              Dies de runway
            </label>
            <div
              class="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg flex items-end gap-4"
            >
              <div class="text-center">
                <p class="text-xs text-dark-muted mb-1">dies</p>
                <p class="text-2xl font-bold text-primary-text">
                  {{ runwayDays !== null ? runwayDays : "—" }}
                </p>
              </div>
              @if (runwayDays !== null && runwayDays > 0) {
                <div class="text-dark-muted pb-1">/</div>
                <div class="text-center">
                  <p class="text-xs text-dark-muted mb-1">mesos</p>
                  <p class="text-2xl font-bold text-primary-text">
                    {{ runwayMonths }}
                  </p>
                </div>
                <div class="text-dark-muted pb-1">/</div>
                <div class="text-center">
                  <p class="text-xs text-dark-muted mb-1">anys</p>
                  <p class="text-2xl font-bold text-primary-text">
                    {{ runwayYears }}
                  </p>
                </div>
                <div class="text-dark-muted pb-1">→</div>
                <div class="text-center">
                  <p class="text-xs text-dark-muted mb-1">data final</p>
                  <p class="text-2xl font-bold text-primary-text">
                    {{ endDate }}
                  </p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class DashboardContentComponent implements OnInit {
  private eventsService = inject(EventsService);
  private isinService = inject(IsinService);

  // Pie Chart Configuration
  pieChartOptions: ChartConfiguration<"pie">["options"] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#f1f5f9",
          font: {
            size: 12,
          },
          padding: 15,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              const dataset = data.datasets[0];
              const total = (dataset.data as number[]).reduce(
                (a, b) => a + b,
                0,
              );

              return data.labels.map((label, i) => {
                const value = dataset.data[i] as number;
                const percentage = ((value / total) * 100).toFixed(1);

                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: (dataset.backgroundColor as string[])[i],
                  strokeStyle: dataset.borderColor as string,
                  lineWidth: dataset.borderWidth as number,
                  fontColor: "#f1f5f9",
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed || 0;
            const formatted = new Intl.NumberFormat("ca-ES", {
              style: "currency",
              currency: "EUR",
            }).format(value);
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0,
            ) as number;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${formatted} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        color: "#ffffff",
        font: {
          size: 14,
          weight: "bold",
        },
        formatter: (value: number, context: any) => {
          const total = context.chart.data.datasets[0].data.reduce(
            (a: number, b: number) => a + b,
            0,
          );
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
      },
    },
  };

  pieChartData = computed<ChartConfiguration<"pie">["data"]>(() => {
    const assets = this.assets();
    return {
      labels: assets.map((a) => `${a.ticker} - ${a.nom}`),
      datasets: [
        {
          data: assets.map((a) => a.costTotal),
          backgroundColor: [
            "#6366f1", // Indigo vibrant
            "#ec4899", // Pink modern
            "#14b8a6", // Teal
            "#f59e0b", // Amber
            "#8b5cf6", // Purple
            "#06b6d4", // Cyan
            "#f97316", // Orange
            "#10b981", // Emerald
            "#6366f1", // Indigo (repeat for more assets)
            "#a855f7", // Fuchsia
            "#0ea5e9", // Sky blue
            "#84cc16", // Lime
          ],
          borderColor: "#1e293b",
          borderWidth: 2,
        },
      ],
    };
  });

  estalvis: number = 0;
  costDiari: number = 70;
  runwayDays: number | null = null;
  runwayMonths: number = 0;
  runwayYears: number = 0;
  endDate: string = "";

  // Computed signal per als assets
  assets = computed(() => {
    const events = this.eventsService.obtenirTots()();
    const isins = this.isinService.obtenirTots()();
    const assetsMap = new Map<string, Asset>();

    // Ordenar events per data (més antics primer)
    const eventsOrdenats = [...events].sort(
      (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime(),
    );

    // Processar tots els events
    eventsOrdenats.forEach((event) => {
      if (!assetsMap.has(event.isin)) {
        const isinData = isins.find((i) => i.isin === event.isin);
        assetsMap.set(event.isin, {
          isin: event.isin,
          ticker: isinData?.ticker || "N/A",
          nom: isinData?.nom || "Desconegut",
          quantitatAccions: 0,
          costTotal: 0,
        });
      }

      const asset = assetsMap.get(event.isin)!;

      if (event.tipusEvent === "compra") {
        asset.quantitatAccions += event.numeroAccions;
        asset.costTotal += event.preuTotal;
      } else if (event.tipusEvent === "venta") {
        // Calcular cost mitjà abans de la venta
        const costMitja =
          asset.quantitatAccions > 0
            ? asset.costTotal / asset.quantitatAccions
            : 0;
        // Restar accions
        asset.quantitatAccions -= event.numeroAccions;
        // Restar cost proporcional (no el preu de venta)
        asset.costTotal -= costMitja * event.numeroAccions;
      }
      // Els dividends no afecten la quantitat d'accions ni el cost
    });

    // Filtrar assets amb quantitat > 0
    return Array.from(assetsMap.values()).filter(
      (asset) => asset.quantitatAccions > 0,
    );
  });

  totalCostPortafoli = computed(() => {
    return this.assets().reduce((sum, asset) => sum + asset.costTotal, 0);
  });

  ngOnInit() {
    // Inicialitzar estalvis amb el cost total del portafoli (arrodonit)
    this.estalvis = Math.round(this.totalCostPortafoli());
    this.calculateRunway();
  }

  calculateRunway() {
    if (this.costDiari > 0) {
      this.runwayDays = Math.floor(this.estalvis / this.costDiari);
      this.runwayMonths = Math.round((this.runwayDays / 30) * 10) / 10;
      this.runwayYears = Math.round((this.runwayDays / 365) * 10) / 10;

      // Calculate end date
      const today = new Date();
      const finalDate = new Date(
        today.getTime() + this.runwayDays * 24 * 60 * 60 * 1000,
      );
      const day = String(finalDate.getDate()).padStart(2, "0");
      const month = String(finalDate.getMonth() + 1).padStart(2, "0");
      const year = finalDate.getFullYear();
      this.endDate = `${day}/${month}/${year}`;
    } else {
      this.runwayDays = null;
      this.runwayMonths = 0;
      this.runwayYears = 0;
      this.endDate = "";
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat("ca-ES", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  }
}
