import { Component, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { ExportImportService } from "../../services/export-import.service";
import { AuthService } from "../../services/auth.service";
import { LucideAngularModule, Download, Upload } from "lucide-angular";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: "./header.component.html",
})
export class HeaderComponent {
  private exportImportService = inject(ExportImportService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Lucide icons
  readonly Download = Download;
  readonly Upload = Upload;
  readonly user = this.authService.user;
  readonly isAuthenticated = this.authService.isAuthenticated;

  exportar(): void {
    this.exportImportService.exportarDades();
  }

  importar(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.exportImportService
        .importarDades(file)
        .then(() => {
          // Reset input so the same file can be selected again
          input.value = "";
        })
        .catch((error) => {
          console.error("Error important:", error);
          input.value = "";
        });
    }
  }

  logout(): void {
    this.authService.signOut();
    this.router.navigateByUrl("/login");
  }
}
