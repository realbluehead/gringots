import { Component, DestroyRef, effect, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly isConfigured = this.authService.isConfigured;
  errorMessage = "";

  constructor() {
    const authEffect = effect(() => {
      const user = this.authService.user();

      if (user) {
        this.navigateAfterLogin();
      }
    });

    this.destroyRef.onDestroy(() => authEffect.destroy());
  }

  loginWithGoogle(): void {
    this.errorMessage = "";

    this.authService.triggerGoogleLoginPrompt().catch((error) => {
      this.errorMessage =
        "No s'ha pogut obrir Google Login. Revisa Authorized JavaScript origins a Google Cloud Console (inclou http://localhost:4200) i comprova que el navegador permet popups de Google.";
      console.error("Error obrint Google Login", error);
    });
  }

  private navigateAfterLogin(): void {
    const redirectTo = this.route.snapshot.queryParamMap.get("redirectTo");
    this.router.navigateByUrl(redirectTo || "/dashboard");
  }
}
