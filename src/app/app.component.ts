import { Component } from "@angular/core";
import { DashboardComponent } from "./pages/dashboard/dashboard.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [DashboardComponent],
  templateUrl: "./app.component.html",
})
export class AppComponent {}
