import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideToastr } from "ngx-toastr";
import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideToastr({
      timeOut: 5000,
      positionClass: "toast-top-right",
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
      newestOnTop: true,
      tapToDismiss: true,
      maxOpened: 5,
      autoDismiss: false,
    }),
  ],
}).catch((err) => console.error(err));
