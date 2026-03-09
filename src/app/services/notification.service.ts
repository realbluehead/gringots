import { Injectable, inject } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import Swal from "sweetalert2";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private toastr = inject(ToastrService);

  success(message: string, title: string = "Èxit"): void {
    this.toastr.success(message, title);
  }

  error(message: string, title: string = "Error"): void {
    this.toastr.error(message, title);
  }

  info(message: string, title: string = "Informació"): void {
    this.toastr.info(message, title);
  }

  warning(message: string, title: string = "Avís"): void {
    this.toastr.warning(message, title);
  }

  // Method to show confirmation dialog using SweetAlert2
  confirm(
    message: string,
    onConfirm: () => void,
    title: string = "Confirmar acció",
  ): void {
    Swal.fire({
      title: title,
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancel·lar",
      background: "#1e293b",
      color: "#f1f5f9",
      customClass: {
        popup: "swal-dark-popup",
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();
      }
    });
  }
}
