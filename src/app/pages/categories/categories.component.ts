import { Component, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Category } from "../../models/category.model";
import { CategoryService } from "../../services/category.service";
import { NotificationService } from "../../services/notification.service";
import { LucideAngularModule, Pencil, Trash2 } from "lucide-angular";

@Component({
  selector: "app-categories",
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: "./categories.component.html",
})
export class CategoriesComponent {
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);

  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;

  filtreCerca = "";

  categoriaEditant: string | null = null;
  formulariEdicio: Partial<Category> = {};

  categories = this.categoryService.obtenirTotes();

  categoriesFiltrades = computed(() => {
    let resultats = this.categories();
    if (this.filtreCerca) {
      const cerca = this.filtreCerca.toLowerCase();
      resultats = resultats.filter((c) => c.nom.toLowerCase().includes(cerca));
    }
    return resultats;
  });

  netejarFiltres() {
    this.filtreCerca = "";
  }

  private readonly PALETA_COLORS = [
    "#6366f1",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#3b82f6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#8b5cf6",
    "#84cc16",
    "#06b6d4",
    "#e11d48",
    "#a855f7",
    "#22c55e",
    "#0ea5e9",
  ];

  private colorPerDefecte(): string {
    const colorsUsats = new Set(
      this.categories().map((c) => c.color.toLowerCase()),
    );
    const lliure = this.PALETA_COLORS.find(
      (c) => !colorsUsats.has(c.toLowerCase()),
    );
    return lliure ?? this.PALETA_COLORS[0];
  }

  afegirCategoria() {
    this.categoriaEditant = "nou";
    this.formulariEdicio = { nom: "", color: this.colorPerDefecte() };
  }

  editarCategoria(categoria: Category) {
    this.categoriaEditant = categoria.id;
    this.formulariEdicio = { ...categoria };
  }

  esborrarCategoria(id: string) {
    this.notificationService.confirm(
      "Estàs segur que vols esborrar aquesta categoria?",
      () => {
        this.categoryService.esborrar(id);
        this.notificationService.success("Categoria esborrada correctament");
      },
    );
  }

  guardarCategoria() {
    if (!this.formulariEdicio.nom?.trim()) {
      this.notificationService.warning(
        "Si us plau, omple el nom de la categoria",
      );
      return;
    }

    if (this.categoriaEditant === "nou") {
      this.categoryService.afegir(this.formulariEdicio as Category);
      this.notificationService.success("Categoria creada correctament");
    } else if (this.categoriaEditant) {
      this.categoryService.actualitzar(
        this.categoriaEditant,
        this.formulariEdicio,
      );
      this.notificationService.success("Categoria actualitzada correctament");
    }

    this.cancelarEdicio();
  }

  cancelarEdicio() {
    this.categoriaEditant = null;
    this.formulariEdicio = {};
  }
}
