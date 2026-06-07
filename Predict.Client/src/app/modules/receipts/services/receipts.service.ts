import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { LocalStorageService } from 'src/app/platform/services/local-storage.service';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import { ReceiptDomain } from '../models/receipts-domain.model';
import { ReceiptDto } from '../models/receipts-dto.model';

export const ReceiptsService_STORAGE_KEY = 'Receipts_Cache_May_2025';

@Injectable({ providedIn: 'root' })
export class ReceiptsService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly localStorage: LocalStorageService,
  ) {}

  getReceipts(startDate: Date, endDate: Date): Observable<ReceiptDomain[]> {
    const cachedDtos = this.localStorage.getItem<ReceiptDto[]>(
      ReceiptsService_STORAGE_KEY,
    );

    const source$ = cachedDtos
      ? of(cachedDtos)
      : this.httpClient
          .get<
            ReceiptDto[]
          >(`/server/api/v1/receipts?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
          .pipe(
            tap((dtos) =>
              this.localStorage.setItem(ReceiptsService_STORAGE_KEY, dtos),
            ),
          );

    return source$.pipe(
      map((dtos) => this.convertToModels(dtos)),
      map((receipts) =>
        receipts.filter(
          ({ date }) =>
            JsDateUtils.isValidDate(date) &&
            date >= startDate &&
            date <= endDate,
        ),
      ),
    );
  }

  private convertToModels(dtos: ReceiptDto[]): ReceiptDomain[] {
    return dtos.map((dto) => new ReceiptDomain(dto));
  }
}
