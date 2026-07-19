import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastNotificationComponent } from './platform/toast-notifications/toast-notification.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';

@Component({
  selector: 'p-root',
  imports: [
    RouterModule,
    SpinnerComponent,
    ToastNotificationComponent,
    HttpClientModule,
  ],
  providers: [],
  template: `
    <p-spinner />
    <p-toast />
    <router-outlet />
  `,
  styleUrls: ['app.component.scss'],
})
export class AppComponent {}
