export type EventType = "compra" | "venta" | "dividend";

export interface FinancialEvent {
  id: string;
  data: Date;
  isin: string;
  tipusEvent: EventType;
  numeroAccions: number;
  preuPerAccio: number;
  preuTotal: number;
}
