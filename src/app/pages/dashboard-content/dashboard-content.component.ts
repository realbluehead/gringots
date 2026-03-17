import {
  Component,
  Type,
  inject,
  OnInit,
  computed,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { forkJoin } from "rxjs";
import { EventsService } from "../../services/events.service";
import { IsinService } from "../../services/isin.service";
import { StockPricesService } from "../../services/stock-prices.service";
import { CryptoAddressService } from "../../services/crypto-address.service";
import { PolicyIdService } from "../../services/policy-id.service";
import { DailyEntryService } from "../../services/daily-entry.service";
import { CategoryService } from "../../services/category.service";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import {
  ChartConfiguration,
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarController,
  BarElement,
  PieController,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { SankeyController, Flow } from "chartjs-chart-sankey";
import { SankeyDataPoint } from "./panels/cashflow-sankey-panel.component";
import { AssetsPanelComponent } from "./panels/assets-panel.component";
import { CryptoPanelComponent } from "./panels/crypto-panel.component";
import { RunwayPanelComponent } from "./panels/runway-panel.component";
import { AssetsPiePanelComponent } from "./panels/assets-pie-panel.component";
import { PortfolioTimelinePanelComponent } from "./panels/portfolio-timeline-panel.component";
import { CashflowLinePanelComponent } from "./panels/cashflow-line-panel.component";
import { CashflowPiePanelComponent } from "./panels/cashflow-pie-panel.component";
import { CashflowSankeyPanelComponent } from "./panels/cashflow-sankey-panel.component";

// Registrar components de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarController,
  BarElement,
  PieController,
  Filler,
  Tooltip,
  Legend,
  ArcElement,
  SankeyController,
  Flow,
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

type GlobalPanelId =
  | "assets"
  | "crypto"
  | "runway"
  | "assetsPie"
  | "portfolioTimeline";
type CashflowPanelId = "cashflowLine" | "cashflowPie" | "cashflowSankey";
type DashboardTabId = "global" | "cashflow";
type DashboardPanelId = GlobalPanelId | CashflowPanelId;
type PanelComponentKey =
  | "assetsPanel"
  | "cryptoPanel"
  | "runwayPanel"
  | "assetsPiePanel"
  | "portfolioTimelinePanel"
  | "cashflowLinePanel"
  | "cashflowPiePanel"
  | "cashflowSankeyPanel";

type GlobalPanelSpan = 1 | 2 | 3 | 4;
type CashflowPanelSpan = 1 | 2 | 3;

interface DashboardPanelJsonConfig {
  id: DashboardPanelId;
  label: string;
  component: PanelComponentKey;
  maxSpan: 3 | 4;
}

interface DashboardTabJsonConfig {
  id: DashboardTabId;
  label: string;
  maxColumns: 3 | 4;
  panelIds: DashboardPanelId[];
}

interface DashboardLayoutConfig {
  globalPanelOrder: GlobalPanelId[];
  globalPanelSpans: Record<GlobalPanelId, GlobalPanelSpan>;
  cashflowPanelOrder: CashflowPanelId[];
  cashflowPanelSpans: Record<CashflowPanelId, CashflowPanelSpan>;
}

const PANEL_COMPONENTS: Record<PanelComponentKey, Type<unknown>> = {
  assetsPanel: AssetsPanelComponent,
  cryptoPanel: CryptoPanelComponent,
  runwayPanel: RunwayPanelComponent,
  assetsPiePanel: AssetsPiePanelComponent,
  portfolioTimelinePanel: PortfolioTimelinePanelComponent,
  cashflowLinePanel: CashflowLinePanelComponent,
  cashflowPiePanel: CashflowPiePanelComponent,
  cashflowSankeyPanel: CashflowSankeyPanelComponent,
};

// JSON-like dashboard config so tabs/panels can come from persisted or remote config later.
const DASHBOARD_PANELS_CONFIG: Record<
  DashboardPanelId,
  DashboardPanelJsonConfig
> = {
  assets: {
    id: "assets",
    label: "Actius",
    component: "assetsPanel",
    maxSpan: 4,
  },
  crypto: {
    id: "crypto",
    label: "Cryptoactius",
    component: "cryptoPanel",
    maxSpan: 4,
  },
  runway: {
    id: "runway",
    label: "Runway",
    component: "runwayPanel",
    maxSpan: 4,
  },
  assetsPie: {
    id: "assetsPie",
    label: "Distribucio d'actius",
    component: "assetsPiePanel",
    maxSpan: 4,
  },
  portfolioTimeline: {
    id: "portfolioTimeline",
    label: "Evolucio inversio",
    component: "portfolioTimelinePanel",
    maxSpan: 4,
  },
  cashflowLine: {
    id: "cashflowLine",
    label: "Cashflow diari",
    component: "cashflowLinePanel",
    maxSpan: 3,
  },
  cashflowPie: {
    id: "cashflowPie",
    label: "Despeses per categoria",
    component: "cashflowPiePanel",
    maxSpan: 3,
  },
  cashflowSankey: {
    id: "cashflowSankey",
    label: "Flux de despeses",
    component: "cashflowSankeyPanel",
    maxSpan: 3,
  },
};

const DASHBOARD_TABS_CONFIG: DashboardTabJsonConfig[] = [
  {
    id: "global",
    label: "Global",
    maxColumns: 4,
    panelIds: ["assets", "crypto", "runway", "assetsPie", "portfolioTimeline"],
  },
  {
    id: "cashflow",
    label: "Cashflow",
    maxColumns: 3,
    panelIds: ["cashflowLine", "cashflowPie", "cashflowSankey"],
  },
];

@Component({
  selector: "app-dashboard-content",
  standalone: true,
  imports: [CommonModule, FormsModule, CdkDropList, CdkDrag],
  templateUrl: "./dashboard-content.component.html",
  styles: [
    `
      @media (min-width: 1024px) {
        .dashboard-panel {
          grid-column: span var(--panel-span) / span var(--panel-span);
        }
      }
    `,
  ],
})
export class DashboardContentComponent implements OnInit {
  private readonly LAYOUT_STORAGE_KEY = "gringots_dashboard_layout_v1";
  tabsConfig = DASHBOARD_TABS_CONFIG;
  panelsConfig = DASHBOARD_PANELS_CONFIG;

  private eventsService = inject(EventsService);
  private isinService = inject(IsinService);
  private stockPricesService = inject(StockPricesService);
  private cryptoAddressService = inject(CryptoAddressService);
  private policyIdService = inject(PolicyIdService);
  private dailyEntryService = inject(DailyEntryService);
  private categoryService = inject(CategoryService);
  private http = inject(HttpClient);

  stockPrices: Map<string, number> = new Map();
  assetsWithPrices: Asset[] = [];
  totalProfitLoss: number = 0;
  totalProfitLossPercent: number = 0;
  totalValorActual: number = 0;

  globalPanelOrder = signal<GlobalPanelId[]>([
    "assets",
    "crypto",
    "runway",
    "assetsPie",
    "portfolioTimeline",
  ]);
  globalPanelSpans = signal<Record<GlobalPanelId, GlobalPanelSpan>>({
    assets: 2,
    crypto: 1,
    runway: 1,
    assetsPie: 2,
    portfolioTimeline: 2,
  });
  cashflowPanelOrder = signal<CashflowPanelId[]>([
    "cashflowLine",
    "cashflowPie",
    "cashflowSankey",
  ]);
  cashflowPanelSpans = signal<Record<CashflowPanelId, CashflowPanelSpan>>({
    cashflowLine: 2,
    cashflowPie: 1,
    cashflowSankey: 3,
  });

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
                  fillStyle: ((dataset as any).backgroundColor as string[])[i],
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
        display: true,
        anchor: "end",
        align: "end",
        offset: 8,
        clamp: true,
        color: "#ffffff",
        font: {
          weight: "bold",
          size: 11,
        },
        formatter: (value: number, context: any) => {
          const data = context.chart.data.datasets[0].data as number[];
          const total = data.reduce((a, b) => a + b, 0);
          if (total <= 0) return "0%";
          const percentage = (value / total) * 100;
          return `${percentage.toFixed(1)}%`;
        },
      },
    },
  };

  pieChartData = computed<ChartConfiguration<"pie">["data"]>(() => {
    const assets = [...this.assets()].sort((a, b) => b.costTotal - a.costTotal);
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

  activeTab = signal<DashboardTabId>("global");

  // Cashflow tab
  private localDateStr(d: Date): string {
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
  }

  cashflowDateFrom = signal<string>(
    this.localDateStr(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    ),
  );
  cashflowDateTo = signal<string>(this.localDateStr(new Date()));
  cashflowPeriodicity = signal<"diari" | "setmanal" | "mensual">("diari");

  cashflowChartData = computed<ChartConfiguration<"line">["data"]>(() => {
    const entries = this.dailyEntryService.obtenirTots()();
    const from = this.cashflowDateFrom();
    const to = this.cashflowDateTo();
    const periodicity = this.cashflowPeriodicity();

    const filtered = entries.filter((e) => {
      const ds = this.localDateStr(new Date(e.data));
      return ds >= from && ds <= to;
    });

    const getGroupKey = (date: Date): string => {
      if (periodicity === "diari") {
        return this.localDateStr(date);
      } else if (periodicity === "setmanal") {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
        return this.localDateStr(d);
      } else {
        const [y, m] = this.localDateStr(date).split("-");
        return `${y}-${m}`;
      }
    };

    const formatLabel = (key: string): string => {
      if (periodicity === "mensual") {
        const [y, m] = key.split("-");
        return `${m}/${y}`;
      }
      const [y, m, d] = key.split("-");
      return `${d}/${m}/${y}`;
    };

    const groupMap = new Map<string, { ingressos: number; despeses: number }>();
    filtered.forEach((e) => {
      const key = getGroupKey(new Date(e.data));
      if (!groupMap.has(key)) groupMap.set(key, { ingressos: 0, despeses: 0 });
      const g = groupMap.get(key)!;
      if (e.tipus === "ingres") g.ingressos += e.import;
      else g.despeses += e.import;
    });

    const sortedKeys = Array.from(groupMap.keys()).sort();
    const labels = sortedKeys.map(formatLabel);

    return {
      labels,
      datasets: [
        {
          label: "Ingressos",
          data: sortedKeys.map((k) => groupMap.get(k)!.ingressos),
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          borderColor: "#10b981",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: "Despeses",
          data: sortedKeys.map((k) => groupMap.get(k)!.despeses),
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          borderColor: "#ef4444",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  });

  cashflowPieChartData = computed<ChartConfiguration<"pie">["data"]>(() => {
    const entries = this.dailyEntryService.obtenirTots()();
    const categories = this.categoryService.obtenirTotes()();
    const from = this.cashflowDateFrom();
    const to = this.cashflowDateTo();

    const filtered = entries.filter((e) => {
      const ds = this.localDateStr(new Date(e.data));
      return e.tipus === "despesa" && ds >= from && ds <= to;
    });

    const catMap = new Map<string, number>();
    filtered.forEach((e) => {
      const key = e.categoriaId ?? "__sense_categoria__";
      catMap.set(key, (catMap.get(key) ?? 0) + e.import);
    });

    const COLORS = [
      "#6366f1",
      "#ec4899",
      "#14b8a6",
      "#f59e0b",
      "#8b5cf6",
      "#06b6d4",
      "#f97316",
      "#10b981",
      "#a855f7",
      "#0ea5e9",
      "#84cc16",
      "#ef4444",
    ];

    const sorted = Array.from(catMap.entries()).sort((a, b) => a[1] - b[1]);

    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColors: string[] = [];
    let colorIdx = 0;

    sorted.forEach(([catId, total]) => {
      const cat = categories.find((c) => c.id === catId);
      labels.push(cat?.nom ?? "Sense categoria");
      data.push(total);
      backgroundColors.push(cat?.color ?? COLORS[colorIdx % COLORS.length]);
      colorIdx++;
    });

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderColor: "#1e293b",
          borderWidth: 2,
        },
      ],
    };
  });

  cashflowSankeyChartData = computed<{
    records: SankeyDataPoint[];
    colorMap: Record<string, string>;
  }>(() => {
    const entries = this.dailyEntryService.obtenirTots()();
    const categories = this.categoryService.obtenirTotes()();
    const from = this.cashflowDateFrom();
    const to = this.cashflowDateTo();

    const filtered = entries.filter((e) => {
      const ds = this.localDateStr(new Date(e.data));
      return e.tipus === "despesa" && ds >= from && ds <= to;
    });

    const catMap = new Map<string, number>();
    filtered.forEach((e) => {
      const key = e.categoriaId ?? "__sense_categoria__";
      catMap.set(key, (catMap.get(key) ?? 0) + e.import);
    });

    const records: SankeyDataPoint[] = [];
    const colorMap: Record<string, string> = { Despeses: "#ef4444" };

    catMap.forEach((total, catId) => {
      const cat = categories.find((c) => c.id === catId);
      const catName = cat?.nom ?? "Sense categoria";
      records.push({ from: "Despeses", to: catName, flow: total });
      colorMap[catName] = cat?.color ?? "#6b7280";
    });

    return { records, colorMap };
  });

  cashflowPieChartOptions: ChartConfiguration<"pie">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#f1f5f9",
          font: { size: 11 },
          padding: 12,
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
                const pct =
                  total > 0 ? ((value / total) * 100).toFixed(1) : "0";
                return {
                  text: `${label} (${pct}%)`,
                  fillStyle: ((dataset as any).backgroundColor as string[])[i],
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
            const value = context.parsed ?? 0;
            const total = (context.dataset.data as number[]).reduce(
              (a: number, b: number) => a + b,
              0,
            );
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
            return `${pct}%`;
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
  };

  cashflowChartOptions: ChartConfiguration<"line">["options"] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: { color: "#f1f5f9", font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = Math.abs(context.parsed.y ?? 0);
            const formatted = new Intl.NumberFormat("ca-ES", {
              style: "currency",
              currency: "EUR",
            }).format(value);
            return `${context.dataset.label}: ${formatted}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8", maxRotation: 45, minRotation: 45 },
        grid: { color: "#334155" },
      },
      y: {
        ticks: {
          color: "#94a3b8",
          callback: (value) =>
            new Intl.NumberFormat("ca-ES", {
              style: "currency",
              currency: "EUR",
              notation: "compact",
              maximumFractionDigits: 0,
            }).format(value as number),
        },
        grid: { color: "#334155" },
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
  guanys: number = 0;
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

  private saveLayoutConfig(): void {
    const config: DashboardLayoutConfig = {
      globalPanelOrder: this.globalPanelOrder(),
      globalPanelSpans: this.globalPanelSpans(),
      cashflowPanelOrder: this.cashflowPanelOrder(),
      cashflowPanelSpans: this.cashflowPanelSpans(),
    };

    localStorage.setItem(this.LAYOUT_STORAGE_KEY, JSON.stringify(config));
  }

  private loadLayoutConfig(): void {
    const raw = localStorage.getItem(this.LAYOUT_STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<DashboardLayoutConfig>;

      const globalOrder = parsed.globalPanelOrder;
      if (
        Array.isArray(globalOrder) &&
        globalOrder.length === 5 &&
        ["assets", "crypto", "runway", "assetsPie", "portfolioTimeline"].every(
          (id) => globalOrder.includes(id as GlobalPanelId),
        )
      ) {
        this.globalPanelOrder.set(globalOrder as GlobalPanelId[]);
      }

      const cashflowOrder = parsed.cashflowPanelOrder;
      if (Array.isArray(cashflowOrder)) {
        const ALL_CASHFLOW_IDS: CashflowPanelId[] = [
          "cashflowLine",
          "cashflowPie",
          "cashflowSankey",
        ];
        const validOrder = cashflowOrder.filter((id): id is CashflowPanelId =>
          ALL_CASHFLOW_IDS.includes(id as CashflowPanelId),
        );
        ALL_CASHFLOW_IDS.forEach((id) => {
          if (!validOrder.includes(id)) validOrder.push(id);
        });
        this.cashflowPanelOrder.set(validOrder);
      }

      const globalSpans = parsed.globalPanelSpans;
      if (globalSpans) {
        this.globalPanelSpans.set({
          assets:
            globalSpans.assets === 1 ||
            globalSpans.assets === 2 ||
            globalSpans.assets === 3 ||
            globalSpans.assets === 4
              ? globalSpans.assets
              : this.globalPanelSpans().assets,
          crypto:
            globalSpans.crypto === 1 ||
            globalSpans.crypto === 2 ||
            globalSpans.crypto === 3 ||
            globalSpans.crypto === 4
              ? globalSpans.crypto
              : this.globalPanelSpans().crypto,
          runway:
            globalSpans.runway === 1 ||
            globalSpans.runway === 2 ||
            globalSpans.runway === 3 ||
            globalSpans.runway === 4
              ? globalSpans.runway
              : this.globalPanelSpans().runway,
          assetsPie:
            globalSpans.assetsPie === 1 ||
            globalSpans.assetsPie === 2 ||
            globalSpans.assetsPie === 3 ||
            globalSpans.assetsPie === 4
              ? globalSpans.assetsPie
              : this.globalPanelSpans().assetsPie,
          portfolioTimeline:
            globalSpans.portfolioTimeline === 1 ||
            globalSpans.portfolioTimeline === 2 ||
            globalSpans.portfolioTimeline === 3 ||
            globalSpans.portfolioTimeline === 4
              ? globalSpans.portfolioTimeline
              : this.globalPanelSpans().portfolioTimeline,
        });
      }

      const cashflowSpans = parsed.cashflowPanelSpans;
      if (cashflowSpans) {
        this.cashflowPanelSpans.set({
          cashflowLine:
            cashflowSpans.cashflowLine === 1 ||
            cashflowSpans.cashflowLine === 2 ||
            cashflowSpans.cashflowLine === 3
              ? cashflowSpans.cashflowLine
              : this.cashflowPanelSpans().cashflowLine,
          cashflowPie:
            cashflowSpans.cashflowPie === 1 ||
            cashflowSpans.cashflowPie === 2 ||
            cashflowSpans.cashflowPie === 3
              ? cashflowSpans.cashflowPie
              : this.cashflowPanelSpans().cashflowPie,
          cashflowSankey:
            cashflowSpans.cashflowSankey === 1 ||
            cashflowSpans.cashflowSankey === 2 ||
            cashflowSpans.cashflowSankey === 3
              ? cashflowSpans.cashflowSankey
              : this.cashflowPanelSpans().cashflowSankey,
        });
      }
    } catch (error) {
      console.error("Error carregant configuracio de layout:", error);
    }
  }

  setGlobalPanelSpan(panelId: GlobalPanelId, value: number): void {
    const span = Number(value);
    const safeSpan: GlobalPanelSpan =
      span === 1 || span === 2 || span === 3 || span === 4 ? span : 1;

    this.globalPanelSpans.update((state) => ({
      ...state,
      [panelId]: safeSpan,
    }));
    this.saveLayoutConfig();
  }

  getGlobalPanelSpan(panelId: GlobalPanelId): GlobalPanelSpan {
    return this.globalPanelSpans()[panelId];
  }

  setCashflowPanelSpan(panelId: CashflowPanelId, value: number): void {
    const span = Number(value);
    const safeSpan: CashflowPanelSpan =
      span === 1 || span === 2 || span === 3 ? span : 1;

    this.cashflowPanelSpans.update((state) => ({
      ...state,
      [panelId]: safeSpan,
    }));
    this.saveLayoutConfig();
  }

  getCashflowPanelSpan(panelId: CashflowPanelId): CashflowPanelSpan {
    return this.cashflowPanelSpans()[panelId];
  }

  getActiveTabConfig(): DashboardTabJsonConfig {
    const config = this.tabsConfig.find((tab) => tab.id === this.activeTab());
    if (!config) {
      throw new Error(`No tab config found for ${this.activeTab()}`);
    }
    return config;
  }

  getActivePanelOrder(): DashboardPanelId[] {
    return this.activeTab() === "global"
      ? this.globalPanelOrder()
      : this.cashflowPanelOrder();
  }

  setActiveTab(tabId: DashboardTabId): void {
    this.activeTab.set(tabId);
  }

  getPanelComponent(panelId: DashboardPanelId): Type<unknown> {
    const panelConfig = this.panelsConfig[panelId];
    return PANEL_COMPONENTS[panelConfig.component];
  }

  getPanelSpan(panelId: DashboardPanelId): number {
    if (
      panelId === "cashflowLine" ||
      panelId === "cashflowPie" ||
      panelId === "cashflowSankey"
    ) {
      return this.getCashflowPanelSpan(panelId);
    }

    return this.getGlobalPanelSpan(panelId);
  }

  getPanelInputs(panelId: DashboardPanelId): Record<string, unknown> {
    switch (panelId) {
      case "assets":
        return {
          span: this.getGlobalPanelSpan(panelId),
          assets: this.getAssetsToDisplay(),
          costDiari: this.costDiari,
          totalCostPortafoli: this.totalCostPortafoli(),
          totalValorActual: this.totalValorActual,
          totalProfitLoss: this.totalProfitLoss,
          totalProfitLossPercent: this.totalProfitLossPercent,
          formatCurrency: (value: number) => this.formatCurrency(value),
          onSpanChange: (value: number) =>
            this.setGlobalPanelSpan(panelId, value),
        };
      case "crypto":
        return {
          span: this.getGlobalPanelSpan(panelId),
          groups: this.cryptoAssetsByPolicyId(),
          onSpanChange: (value: number) =>
            this.setGlobalPanelSpan(panelId, value),
        };
      case "runway":
        return {
          span: this.getGlobalPanelSpan(panelId),
          estalvis: this.estalvis,
          guanys: this.guanys,
          costDiari: this.costDiari,
          runwayDays: this.runwayDays,
          runwayMonths: this.runwayMonths,
          runwayYears: this.runwayYears,
          endDate: this.endDate,
          onEstalvisChange: (value: number) => {
            this.estalvis = Number(value);
            this.calculateRunway();
          },
          onGuanysChange: (value: number) => {
            this.guanys = Number(value);
          },
          onCostDiariChange: (value: number) => {
            this.costDiari = Number(value);
            this.calculateRunway();
          },
          onSpanChange: (value: number) =>
            this.setGlobalPanelSpan(panelId, value),
        };
      case "assetsPie":
        return {
          span: this.getGlobalPanelSpan(panelId),
          chartData: this.pieChartData(),
          chartOptions: this.pieChartOptions,
          hasData: this.assets().length > 0,
          onSpanChange: (value: number) =>
            this.setGlobalPanelSpan(panelId, value),
        };
      case "portfolioTimeline":
        return {
          span: this.getGlobalPanelSpan(panelId),
          periodicity: this.timelinePeriodicity(),
          chartData: this.portfolioTimelineData(),
          chartOptions: this.lineChartOptions,
          hasData: (this.portfolioTimelineData().labels?.length ?? 0) > 0,
          onPeriodicityChange: (value: "diari" | "setmanal" | "mensual") =>
            this.timelinePeriodicity.set(value),
          onSpanChange: (value: number) =>
            this.setGlobalPanelSpan(panelId, value),
        };
      case "cashflowLine":
        return {
          span: this.getCashflowPanelSpan(panelId),
          chartData: this.cashflowChartData(),
          chartOptions: this.cashflowChartOptions,
          hasData: (this.cashflowChartData().labels?.length ?? 0) > 0,
          onSpanChange: (value: number) =>
            this.setCashflowPanelSpan(panelId, value),
        };
      case "cashflowPie":
        return {
          span: this.getCashflowPanelSpan(panelId),
          chartData: this.cashflowPieChartData(),
          chartOptions: this.cashflowPieChartOptions,
          hasData: (this.cashflowPieChartData().labels?.length ?? 0) > 0,
          onSpanChange: (value: number) =>
            this.setCashflowPanelSpan(panelId, value),
        };
      case "cashflowSankey":
        return {
          span: this.getCashflowPanelSpan(panelId),
          sankeyData: this.cashflowSankeyChartData().records,
          colorMap: this.cashflowSankeyChartData().colorMap,
          hasData: this.cashflowSankeyChartData().records.length > 0,
          onSpanChange: (value: number) =>
            this.setCashflowPanelSpan(panelId, value),
        };
    }
  }

  dropGlobalPanels(event: CdkDragDrop<GlobalPanelId[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const next = [...this.globalPanelOrder()];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.globalPanelOrder.set(next);
    this.saveLayoutConfig();
  }

  dropCashflowPanels(event: CdkDragDrop<CashflowPanelId[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const next = [...this.cashflowPanelOrder()];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.cashflowPanelOrder.set(next);
    this.saveLayoutConfig();
  }

  dropPanels(event: CdkDragDrop<DashboardPanelId[]>): void {
    if (this.activeTab() === "global") {
      this.dropGlobalPanels(event as CdkDragDrop<GlobalPanelId[]>);
      return;
    }

    this.dropCashflowPanels(event as CdkDragDrop<CashflowPanelId[]>);
  }

  ngOnInit() {
    this.loadLayoutConfig();

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
    // Obtenir els policy IDs registrats al sistema
    const registeredPolicyIds = new Set(
      this.policyIdService
        .obtenirTots()()
        .map((p) => p.policyId),
    );

    // Filtrar assets per només incloure els que tenen un policy_id registrat
    const filteredAssets = this.cryptoAssets.filter((asset) => {
      const policyId = asset.policy_id;
      return policyId && registeredPolicyIds.has(policyId);
    });

    const groupMap = new Map<
      string,
      { count: number; assetName: string; assets: any[] }
    >();

    filteredAssets.forEach((asset) => {
      const policyId = asset.policy_id;
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
    this.guanys = Math.round(this.totalProfitLoss);
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
