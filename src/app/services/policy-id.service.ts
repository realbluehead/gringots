import { Injectable, signal } from "@angular/core";
import { PolicyId } from "../models/policy-id.model";

@Injectable({
  providedIn: "root",
})
export class PolicyIdService {
  private readonly STORAGE_KEY = "gringots_policy_ids";
  private policyIds = signal<PolicyId[]>([]);

  constructor() {
    this.carregarPolicyIds();
  }

  private carregarPolicyIds(): void {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        const policyIds = JSON.parse(data) as PolicyId[];
        this.policyIds.set(policyIds);
      } catch (error) {
        console.error("Error carregant policy IDs:", error);
        this.policyIds.set([]);
      }
    }
  }

  private guardarPolicyIds(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.policyIds()));
  }

  obtenirTots() {
    return this.policyIds.asReadonly();
  }

  obtenirPerId(id: string): PolicyId | undefined {
    return this.policyIds().find((p) => p.id === id);
  }

  afegir(policyId: Omit<PolicyId, "id">): void {
    const nouPolicyId: PolicyId = {
      ...policyId,
      id: Date.now().toString(),
    };
    this.policyIds.update((policyIds) => [...policyIds, nouPolicyId]);
    this.guardarPolicyIds();
  }

  actualitzar(id: string, policyIdActualitzat: Partial<PolicyId>): void {
    this.policyIds.update((policyIds) =>
      policyIds.map((p) =>
        p.id === id ? { ...p, ...policyIdActualitzat } : p,
      ),
    );
    this.guardarPolicyIds();
  }

  esborrar(id: string): void {
    this.policyIds.update((policyIds) => policyIds.filter((p) => p.id !== id));
    this.guardarPolicyIds();
  }

  // Mètode per importar policy IDs mantenint els IDs originals
  importar(policyIds: PolicyId[]): void {
    this.policyIds.set(policyIds);
    this.guardarPolicyIds();
  }

  // Mètode per netejar totes les dades
  netejar(): void {
    this.policyIds.set([]);
    this.guardarPolicyIds();
  }
}
