import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromInvoices from 'src/app/modules/invoices/reducers/invoices.reducer';
import { SideBarComponent } from 'src/app/shared/components/side-bar/side-bar.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';

@Component({
  selector: 'p-invoices-detailed',
  imports: [SideBarComponent, ToggleButtonComponent],
  templateUrl: './invoices-detailed.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './invoices-detailed.component.scss',
})
export class InvoicesDetailedComponent {
  constructor(private store: Store<fromInvoices.State>) {}

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/invoices/${module.toLowerCase()}`,
      }),
    );
  }
}
