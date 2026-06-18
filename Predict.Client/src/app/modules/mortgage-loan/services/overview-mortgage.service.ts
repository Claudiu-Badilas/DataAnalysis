import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LocalStorageService } from 'src/app/platform/services/local-storage.service';
import { PrintoutsService } from 'src/app/platform/services/printouts.service';
import {
  RepaymentSchedule,
  RepaymentScheduleDto,
} from '../models/mortgage.model';

export const MortgageLoanService_STORAGE_KEY = 'GraficRambursare_18-Jun-2026';

@Injectable({ providedIn: 'root' })
export class MortgageLoanService {
  constructor(
    private readonly _httpClient: HttpClient,
    private readonly _localStorage: LocalStorageService,
    private readonly _printouts: PrintoutsService,
  ) {}

  getRepaymentSchedules(): Observable<RepaymentSchedule[]> {
    const cachedDtos = this._localStorage.getItem<RepaymentScheduleDto[]>(
      MortgageLoanService_STORAGE_KEY,
    );

    if (cachedDtos) return of(this.convertToModels(cachedDtos));

    return this._httpClient
      .get<
        RepaymentScheduleDto[]
      >('https://localhost:8080/api/v1/mortgage-loan/bcr')
      .pipe(
        tap((dtos) =>
          this._localStorage.setItem(MortgageLoanService_STORAGE_KEY, dtos),
        ),
        map((dtos) => this.convertToModels(dtos)),
      );
  }

  private convertToModels(dtos: RepaymentScheduleDto[]): RepaymentSchedule[] {
    return dtos.map((dto) => new RepaymentSchedule(dto));
  }

  downloadRepaymentSchedulesAsJson(): void {
    const cachedDtos = this._localStorage.getItem<RepaymentScheduleDto[]>(
      MortgageLoanService_STORAGE_KEY,
    );
    this._printouts.download(
      cachedDtos,
      `${MortgageLoanService_STORAGE_KEY}.json`,
    );
  }
}
