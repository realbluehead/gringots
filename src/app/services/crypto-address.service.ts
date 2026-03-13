import { Injectable, signal } from "@angular/core";
import { CryptoAddress } from "../models/crypto-address.model";
import { ensureUniqueIds, generateUniqueId } from "../utils/unique-id.util";

@Injectable({
  providedIn: "root",
})
export class CryptoAddressService {
  private readonly STORAGE_KEY = "gringots_crypto_addresses";
  private addresses = signal<CryptoAddress[]>([]);

  constructor() {
    this.carregarAddresses();
  }

  private carregarAddresses(): void {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        const addresses = JSON.parse(data) as CryptoAddress[];
        this.addresses.set(ensureUniqueIds(addresses));
      } catch (error) {
        console.error("Error carregant adreces crypto:", error);
        this.addresses.set([]);
      }
    }
  }

  private guardarAddresses(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.addresses()));
  }

  obtenirTotes() {
    return this.addresses.asReadonly();
  }

  obtenirPerId(id: string): CryptoAddress | undefined {
    return this.addresses().find((a) => a.id === id);
  }

  afegir(address: Omit<CryptoAddress, "id">): void {
    const novaAddress: CryptoAddress = {
      ...address,
      id: generateUniqueId(this.addresses().map((a) => a.id)),
    };
    this.addresses.update((addresses) => [...addresses, novaAddress]);
    this.guardarAddresses();
  }

  actualitzar(id: string, addressActualitzada: Partial<CryptoAddress>): void {
    this.addresses.update((addresses) =>
      addresses.map((a) =>
        a.id === id ? { ...a, ...addressActualitzada } : a,
      ),
    );
    this.guardarAddresses();
  }

  esborrar(id: string): void {
    this.addresses.update((addresses) => addresses.filter((a) => a.id !== id));
    this.guardarAddresses();
  }

  // Mètode per importar adreces mantenint els IDs originals
  importar(addresses: CryptoAddress[]): void {
    this.addresses.set(ensureUniqueIds(addresses));
    this.guardarAddresses();
  }

  // Mètode per netejar totes les dades
  netejar(): void {
    this.addresses.set([]);
    this.guardarAddresses();
  }
}
