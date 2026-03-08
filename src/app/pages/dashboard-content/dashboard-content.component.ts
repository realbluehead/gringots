import { Component } from "@angular/core";

@Component({
  selector: "app-dashboard-content",
  standalone: true,
  imports: [],
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
export class DashboardContentComponent {}
