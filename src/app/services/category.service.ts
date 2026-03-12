import { Injectable, signal } from "@angular/core";
import { Category } from "../models/category.model";

@Injectable({
  providedIn: "root",
})
export class CategoryService {
  private readonly STORAGE_KEY = "gringots_categories";
  private categories = signal<Category[]>([]);

  constructor() {
    this.carregarCategories();
  }

  private carregarCategories(): void {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        const categories = JSON.parse(data) as Category[];
        this.categories.set(categories);
      } catch (error) {
        console.error("Error carregant categories:", error);
        this.categories.set([]);
      }
    }
  }

  private guardarCategories(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.categories()));
  }

  obtenirTotes() {
    return this.categories.asReadonly();
  }

  afegir(category: Category): void {
    const novaCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    this.categories.update((cats) => [...cats, novaCategory]);
    this.guardarCategories();
  }

  actualitzar(id: string, categoryActualitzada: Partial<Category>): void {
    this.categories.update((cats) =>
      cats.map((c) => (c.id === id ? { ...c, ...categoryActualitzada } : c)),
    );
    this.guardarCategories();
  }

  esborrar(id: string): void {
    this.categories.update((cats) => cats.filter((c) => c.id !== id));
    this.guardarCategories();
  }

  importar(categories: Category[]): void {
    this.categories.set(categories);
    this.guardarCategories();
  }

  netejar(): void {
    this.categories.set([]);
    this.guardarCategories();
  }
}
