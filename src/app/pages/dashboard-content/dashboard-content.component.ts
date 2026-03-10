import { Component, inject, OnInit, computed, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { forkJoin } from "rxjs";
import { EventsService } from "../../services/events.service";
import { IsinService } from "../../services/isin.service";
import { StockPricesService } from "../../services/stock-prices.service";
import { CryptoAddressService } from "../../services/crypto-address.service";
import { BaseChartDirective } from "ng2-charts";
import {
  ChartConfiguration,
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  PieController,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Registrar components de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  PieController,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
);

interface Asset {
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
  selector: "app-dashboard-content",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: "./dashboard-content.component.html",
})
export class DashboardContentComponent implements OnInit {
  private eventsService = inject(EventsService);
  private isinService = inject(IsinService);
  private stockPricesService = inject(StockPricesService);
  private cryptoAddressService = inject(CryptoAddressService);
  private http = inject(HttpClient);

  stockPrices: Map<string, number> = new Map();
  assetsWithPrices: Asset[] = [];
  totalProfitLoss: number = 0;
  totalProfitLossPercent: number = 0;
  totalValorActual: number = 0;

  // Crypto assets
  cryptoAssets: any[] = [];
  cryptoAssetsByPolicyId = signal<
    { policyId: string; assetName: string; count: number; assets: any[] }[]
  >([]);

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
        display: false,
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

  // Line Chart Configuration
  lineChartOptions: ChartConfiguration<"line">["options"] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#f1f5f9",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y || 0;
            const formatted = new Intl.NumberFormat("ca-ES", {
              style: "currency",
              currency: "EUR",
            }).format(value);
            return `Cost: ${formatted}`;
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#94a3b8",
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          color: "#334155",
        },
      },
      y: {
        ticks: {
          color: "#94a3b8",
          callback: function (value) {
            return new Intl.NumberFormat("ca-ES", {
              style: "currency",
              currency: "EUR",
              notation: "compact",
            }).format(value as number);
          },
        },
        grid: {
          color: "#334155",
        },
      },
    },
  };

  timelinePeriodicity = signal<"diari" | "setmanal" | "mensual">("setmanal");

  portfolioTimelineData = computed<ChartConfiguration<"line">["data"]>(() => {
    const events = this.eventsService.obtenirTots()();
    const isins = this.isinService.obtenirTots()();
    const periodicity = this.timelinePeriodicity();

    // Ordenar events per data
    const eventsOrdenats = [...events].sort(
      (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime(),
    );

    const labels: string[] = [];
    const data: number[] = [];
    const assetsMap = new Map<
      string,
      { quantitatAccions: number; costTotal: number }
    >();

    const getGroupKey = (date: Date): string => {
      if (periodicity === "diari") {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      } else if (periodicity === "setmanal") {
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor(
          (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000),
        );
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;
      } else {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
      }
    };

    const formatLabel = (key: string): string => {
      if (periodicity === "diari") {
        const [year, month, day] = key.split("-");
        return `${day}/${month}/${year}`;
      } else if (periodicity === "setmanal") {
        return key;
      } else {
        const [year, month] = key.split("-");
        return `${month}/${year}`;
      }
    };

    // Agrupar events per període
    const eventsByPeriod = new Map<string, typeof eventsOrdenats>();

    eventsOrdenats.forEach((event) => {
      const date = new Date(event.data);
      const periodKey = getGroupKey(date);

      if (!eventsByPeriod.has(periodKey)) {
        eventsByPeriod.set(periodKey, []);
      }
      eventsByPeriod.get(periodKey)!.push(event);
    });

    // Processar cada període
    const sortedPeriods = Array.from(eventsByPeriod.keys()).sort();

    sortedPeriods.forEach((periodKey) => {
      const periodEvents = eventsByPeriod.get(periodKey)!;

      // Processar tots els events del període
      periodEvents.forEach((event) => {
        if (!assetsMap.has(event.isin)) {
          assetsMap.set(event.isin, {
            quantitatAccions: 0,
            costTotal: 0,
          });
        }

        const asset = assetsMap.get(event.isin)!;

        if (event.tipusEvent === "compra") {
          asset.quantitatAccions += event.numeroAccions;
          asset.costTotal += event.preuTotal;
        } else if (event.tipusEvent === "venta") {
          const costMitja =
            asset.quantitatAccions > 0
              ? asset.costTotal / asset.quantitatAccions
              : 0;
          asset.quantitatAccions -= event.numeroAccions;
          asset.costTotal -= costMitja * event.numeroAccions;
        }
      });

      // Calcular cost total del portafoli al final del període
      const totalCost = Array.from(assetsMap.values()).reduce(
        (sum, a) => sum + a.costTotal,
        0,
      );

      // Afegir punt al gràfic
      const formattedDate = formatLabel(periodKey);
      labels.push(formattedDate);
      data.push(totalCost);
    });

    return {
      labels,
      datasets: [
        {
          label: "Cost del portafoli",
          data,
          borderColor: "#6366f1",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
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

    // Obtenir tickers únics dels assets i cridar a l'API
    const tickers = this.assets()
      .map((asset) => asset.ticker)
      .filter((ticker) => ticker !== "N/A");

    if (tickers.length > 0) {
      this.stockPricesService.getPrices(tickers).subscribe({
        next: (response) => {
          console.log("Preus obtinguts:", response);

          // Guardar preus al Map
          this.stockPrices.clear();
          response.prices.forEach((priceData) => {
            this.stockPrices.set(priceData.symbol, priceData.price);
          });

          // Actualitzar assets amb preus i calcular profit/loss
          this.updateAssetsWithPrices();
        },
        error: (error) => {
          console.error("Error obtenint preus:", error);
        },
      });
    }

    // Obtenir adreces crypto i cridar a l'API
    const cryptoAddresses = this.cryptoAddressService.obtenirTotes()();

    if (cryptoAddresses.length > 0) {
      const cryptoRequests = cryptoAddresses.map((address) => {
        const apiUrl = `http://localhost:3000/api/crypto/get?address=${address.adressa}`;
        return this.http.get(apiUrl);
      });

      forkJoin(cryptoRequests).subscribe({
        next: (responses) => {
          console.log("Respostes crypto:", responses);

          // Processar i guardar tots els actius crypto
          this.cryptoAssets = [];
          responses.forEach((response: any) => {
            if (response && response.assets && Array.isArray(response.assets)) {
              this.cryptoAssets.push(...response.assets);
            }
          });

          console.log("Total actius crypto:", this.cryptoAssets.length);

          // Agrupar per policy_id
          this.groupCryptoAssetsByPolicyId();
        },
        error: (error) => {
          console.error("Error obtenint info crypto:", error);
        },
      });
    }
  }

  groupCryptoAssetsByPolicyId() {
    const groupMap = new Map<
      string,
      { count: number; assetName: string; assets: any[] }
    >();

    this.cryptoAssets.forEach((asset) => {
      const policyId = asset.policy_id || "unknown";
      const assetName = asset.asset_name || asset.metadata?.name || policyId;
      const quantity = parseInt(asset.quantity || "1", 10);
      const decimals = parseInt(asset.decimals || "0", 10);
      const actualQuantity = Math.round(quantity / Math.pow(10, decimals));

      if (!groupMap.has(policyId)) {
        groupMap.set(policyId, {
          count: 0,
          assetName: assetName,
          assets: [],
        });
      }

      const group = groupMap.get(policyId)!;
      group.count += actualQuantity;
      group.assets.push(asset);
    });

    // Convertir Map a array
    const groupedArray = Array.from(groupMap.entries()).map(
      ([policyId, data]) => ({
        policyId,
        assetName: data.assetName,
        count: data.count,
        assets: data.assets,
      }),
    );

    this.cryptoAssetsByPolicyId.set(groupedArray);
    console.log("Cryptoactius agrupats per policy_id:", groupedArray);
  }

  updateAssetsWithPrices() {
    this.assetsWithPrices = this.assets().map((asset) => {
      const preuActual = this.stockPrices.get(asset.ticker);

      if (preuActual !== undefined) {
        const valorActual = asset.quantitatAccions * preuActual;
        const profitLoss = valorActual - asset.costTotal;
        const profitLossPercent = (profitLoss / asset.costTotal) * 100;

        return {
          ...asset,
          preuActual,
          valorActual,
          profitLoss,
          profitLossPercent,
        };
      }

      return asset;
    });

    // Calcular profit/loss global
    this.totalValorActual = this.assetsWithPrices.reduce(
      (sum, asset) => sum + (asset.valorActual || 0),
      0,
    );

    this.totalProfitLoss = this.assetsWithPrices.reduce(
      (sum, asset) => sum + (asset.profitLoss || 0),
      0,
    );

    const totalCost = this.totalCostPortafoli();
    this.totalProfitLossPercent =
      totalCost > 0 ? (this.totalProfitLoss / totalCost) * 100 : 0;

    // Actualitzar estalvis amb el valor actual del portafoli
    this.estalvis = Math.round(this.totalValorActual);
    this.calculateRunway();
  }

  getAssetsToDisplay(): Asset[] {
    return this.assetsWithPrices.length > 0
      ? this.assetsWithPrices
      : this.assets();
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
