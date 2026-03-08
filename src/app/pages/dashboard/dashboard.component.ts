import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "../../components/header/header.component";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [HeaderComponent, RouterOutlet],
  template: `
    <div class="min-h-screen bg-dark-bg">
      <!-- Header Component -->
      <app-header></app-header>

      <!-- Main Content with Router Outlet -->
      <main class="container mx-auto px-4 py-6">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [],
})
export class DashboardComponent {}
