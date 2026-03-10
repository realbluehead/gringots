import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

interface StockPrice {
  symbol: string;
  price: number;
  currency: string;
  timestamp: string;
}

interface GetPricesResponse {
  prices: StockPrice[];
}

@Injectable({
  providedIn: "root",
})
export class StockPricesService {
  private http = inject(HttpClient);
  private apiUrl = "http://localhost:3000/api/stocks";

  getPrices(symbols: string[]): Observable<GetPricesResponse> {
    return this.http.post<GetPricesResponse>(`${this.apiUrl}/get_prices`, {
      symbols,
    });
  }
}
