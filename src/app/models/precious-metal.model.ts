export interface PreciousMetal {
  id: string;
  data: string; // ISO date format
  metall: "or" | "plata" | "paladium" | "platí";
  puresa: number; // percentage (e.g., 999 for 99.9%)
  grams: number;
  preuCompra: number; // price per gram
  preuTotal?: number; // calculated field
  vendor: string; // vendor/provider name
  descripcio: string; // description/notes
}
