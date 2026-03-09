import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-dashboard-content",
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Dashboard Header -->
      <div>
        <h2 class="text-2xl font-bold text-dark-text mb-2">Dashboard</h2>
        <p class="text-dark-muted">
          Vista general del teu portafoli d'inversions
        </p>
      </div>

      <!-- Dashboard Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-dark-card rounded-lg border border-dark-border p-6">
          <h3 class="text-lg font-semibold text-dark-text mb-2">Valor Total</h3>
          <p class="text-3xl font-bold text-primary-text">€0.00</p>
        </div>

        <div class="bg-dark-card rounded-lg border border-dark-border p-6">
          <h3 class="text-lg font-semibold text-dark-text mb-2">
            Rendiment Diari
          </h3>
          <p class="text-3xl font-bold text-green-500">+0.00%</p>
        </div>

        <div class="bg-dark-card rounded-lg border border-dark-border p-6">
          <h3 class="text-lg font-semibold text-dark-text mb-2">
            Total Actius
          </h3>
          <p class="text-3xl font-bold text-dark-text">0</p>
        </div>
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

      <!-- Placeholder Content -->
      <div class="bg-dark-card rounded-lg border border-dark-border p-6">
        <p class="text-dark-muted text-center">
          Aquí es mostraran els gràfics i taules del portafoli
        </p>
      </div>
    </div>
  `,
  styles: [],
})
export class DashboardContentComponent {
  estalvis: number = 0;
  costDiari: number = 70;
  runwayDays: number | null = null;
  runwayMonths: number = 0;
  runwayYears: number = 0;
  endDate: string = "";

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
}
