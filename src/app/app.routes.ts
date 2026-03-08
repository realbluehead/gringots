import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./pages/dashboard-content/dashboard-content.component").then(
        (m) => m.DashboardContentComponent,
      ),
  },
  {
    path: "events",
    loadComponent: () =>
      import("./pages/events/events.component").then((m) => m.EventsComponent),
  },
  {
    path: "isins",
    loadComponent: () =>
      import("./pages/isins/isins.component").then((m) => m.IsinsComponent),
  },
];
