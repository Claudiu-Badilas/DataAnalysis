import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromLayout from 'src/app/store/reducers/layout.reducer';

@Component({
  selector: 'p-spinner',
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {
  isLoading$ = this.store.select(fromLayout.getIsLoading);

  constructor(private readonly store: Store<fromLayout.State>) {}
}
