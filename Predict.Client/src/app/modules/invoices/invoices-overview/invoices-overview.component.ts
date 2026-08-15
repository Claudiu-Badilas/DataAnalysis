import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import * as fromInvoices from 'src/app/modules/invoices/reducers/invoices.reducer';
import { DropdownSelectComponent } from 'src/app/shared/components/dropdown-select/dropdown-select.component';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { SideBarComponent } from 'src/app/shared/components/side-bar/side-bar.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import { InvoiceIndexTrentChartUtils } from './utils/invoice-index-trent.chart.utils';

@Component({
  selector: 'p-invoices-overview',
  imports: [
    CommonModule,
    SideBarComponent,
    ToggleButtonComponent,
    DropdownSelectComponent,
    HighchartWrapperComponent,
    TopBarComponent,
  ],
  templateUrl: './invoices-overview.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './invoices-overview.component.scss',
})
export class InvoicesOverviewComponent {
  invoices$ = this.store.select(fromInvoices.getInvoices);
  invoiceLocations$ = this.invoices$.pipe(
    map((invoices) => ['No Selection', ...invoices.map((inv) => inv.address)]),
  );
  selectedInvoiceTypes$ = this.invoices$.pipe(
    map((invoices) => [
      'No Selection',
      ...new Set(
        invoices.flatMap((inv) => inv.invoices.map((i) => i.invoiceType)),
      ),
    ]),
  );

  selectedInvoiceLocation$ = new BehaviorSubject<string>('No Selection');
  selectedInvoiceType$ = new BehaviorSubject<string>('No Selection');

  selectedInvoices$ = combineLatest([
    this.invoices$,
    this.selectedInvoiceLocation$,
    this.selectedInvoiceType$,
  ]).pipe(
    map(([invoices, selectedInvoiceLocation, selectedInvoiceType]) => {
      const inv =
        selectedInvoiceLocation === 'No Selection' || !selectedInvoiceLocation
          ? invoices
          : invoices.filter((inv) => inv.address === selectedInvoiceLocation);

      return inv.map((i) => ({
        ...i,
        invoices: i.invoices.filter((invoice) =>
          selectedInvoiceType === 'No Selection'
            ? i.invoices
            : invoice.invoiceType === selectedInvoiceType,
        ),
      }));
    }),
  );
  invoiceIndexTrentCharts$ = this.selectedInvoices$.pipe(
    map((inv) => inv.map((i) => InvoiceIndexTrentChartUtils.getChart(i))),
  );

  constructor(private store: Store<fromInvoices.State>) {}

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/invoices/${module.toLowerCase()}`,
      }),
    );
  }

  onDropdownLocationSelected(event: string) {
    this.selectedInvoiceLocation$.next(event);
  }

  onDropdownProviderSelected(event: string) {
    this.selectedInvoiceType$.next(event);
  }
}
