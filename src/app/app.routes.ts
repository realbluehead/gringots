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
    path: "settings",
    loadComponent: () =>
      import("./pages/settings/settings.component").then(
        (m) => m.SettingsComponent,
      ),
  },
  {
    path: "isins",
    loadComponent: () =>
      import("./pages/isins/isins.component").then((m) => m.IsinsComponent),
  },
  {
    path: "crypto",
    loadComponent: () =>
      import("./pages/crypto/crypto.component").then((m) => m.CryptoComponent),
  },
  {
    path: "diari",
    loadComponent: () =>
      import("./pages/diari/diari.component").then((m) => m.DiariComponent),
  },
];
