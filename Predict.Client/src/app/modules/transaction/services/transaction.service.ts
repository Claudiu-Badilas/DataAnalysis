import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LocalStorageService } from 'src/app/platform/services/local-storage.service';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import {
  TransactionDomain,
  TransactionResponse,
} from '../models/transactions.model';

export const TransactionService_STORAGE_KEY = 'Transactions_Cache_May_2025';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly localStorage: LocalStorageService,
  ) {}

  getTransactions(
    startDate: Date,
    endDate: Date,
  ): Observable<TransactionDomain[]> {
    const cachedDtos = this.localStorage.getItem<TransactionResponse[]>(
      TransactionService_STORAGE_KEY,
    );

    const source$ = cachedDtos
      ? of(cachedDtos)
      : this.httpClient
          .get<TransactionResponse[]>('/server/api/v1/transactions')
          .pipe(
            tap((dtos) =>
              this.localStorage.setItem(TransactionService_STORAGE_KEY, dtos),
            ),
          );

    return source$.pipe(
      map((dtos) => this.convertToModels(dtos)),
      map((transactions) =>
        transactions.filter(
          ({ completionDate }) =>
            JsDateUtils.isValidDate(completionDate) &&
            completionDate >= startDate &&
            completionDate <= endDate,
        ),
      ),
    );
  }

  private convertToModels(dtos: TransactionResponse[]): TransactionDomain[] {
    return dtos.map((dto) => new TransactionDomain(dto));
  }
}
