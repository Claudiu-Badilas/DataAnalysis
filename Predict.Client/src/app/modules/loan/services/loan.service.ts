import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LocalStorageService } from 'src/app/platform/services/local-storage.service';
import { PrintoutsService } from 'src/app/platform/services/printouts.service';
import { RepaymentSchedule, RepaymentScheduleDto } from '../models/loan.model';

export const LoanService_STORAGE_KEY = 'GraficRambursare_18-Aug-2026';

@Injectable({ providedIn: 'root' })
export class LoanService {
  constructor(
    private readonly _httpClient: HttpClient,
    private readonly _localStorage: LocalStorageService,
    private readonly _printouts: PrintoutsService,
  ) {}

  getRepaymentSchedules(): Observable<RepaymentSchedule[]> {
    const cachedDtos = this._localStorage.getItem<RepaymentScheduleDto[]>(
      LoanService_STORAGE_KEY,
    );

    if (cachedDtos) return of(this.convertToModels(cachedDtos));

    return this._httpClient
      .get<RepaymentScheduleDto[]>('https://localhost:8080/api/v1/loan/bcr')
      .pipe(
        tap((dtos) =>
          this._localStorage.setItem(LoanService_STORAGE_KEY, dtos),
        ),
        map((dtos) => this.convertToModels(dtos)),
      );
  }

  private convertToModels(dtos: RepaymentScheduleDto[]): RepaymentSchedule[] {
    return dtos.map((dto) => new RepaymentSchedule(dto));
  }

  downloadRepaymentSchedulesAsJson(): void {
    const cachedDtos = this._localStorage.getItem<RepaymentScheduleDto[]>(
      LoanService_STORAGE_KEY,
    );
    this._printouts.download(cachedDtos, `${LoanService_STORAGE_KEY}.json`);
  }
}
