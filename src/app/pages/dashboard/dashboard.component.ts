import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "../../components/header/header.component";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent {}
