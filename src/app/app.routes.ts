import { Routes } from "@angular/router";
import { authGuard } from "./auth/auth.guard";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./pages/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "",
    loadComponent: () =>
      import("./pages/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
    children: [
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "dashboard",
        canActivate: [authGuard],
        loadComponent: () =>
          import("./pages/dashboard-content/dashboard-content.component").then(
            (m) => m.DashboardContentComponent,
          ),
      },
      {
        path: "events",
        canActivate: [authGuard],
        loadComponent: () =>
          import("./pages/events/events.component").then(
            (m) => m.EventsComponent,
          ),
      },
      {
        path: "settings",
        canActivate: [authGuard],
        loadComponent: () =>
          import("./pages/settings/settings.component").then(
            (m) => m.SettingsComponent,
          ),
      },
      {
        path: "isins",
        canActivate: [authGuard],
        loadComponent: () =>
          import("./pages/isins/isins.component").then((m) => m.IsinsComponent),
      },
      {
        path: "crypto",
        canActivate: [authGuard],
        loadComponent: () =>
          import("./pages/crypto/crypto.component").then(
            (m) => m.CryptoComponent,
          ),
      },
      {
        path: "diari",
        canActivate: [authGuard],
        loadComponent: () =>
          import("./pages/diari/diari.component").then((m) => m.DiariComponent),
      },
    ],
  },
  {
    path: "**",
    redirectTo: "",
  },
];
