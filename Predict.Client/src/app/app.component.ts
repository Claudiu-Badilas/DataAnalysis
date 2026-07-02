import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastNotificationComponent } from './platform/toast-notifications/toast-notification.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { VersionService } from './shared/services/version.service';
import { NewVersionBannerComponent } from './shared/components/new-version-banner/new-version-banner.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'p-root',
  imports: [
    RouterModule,
    SpinnerComponent,
    ToastNotificationComponent,
    NewVersionBannerComponent,
    HttpClientModule,
  ],
  providers: [VersionService],
  template: `
    <p-spinner />
    <p-toast />
    <app-new-version-banner />
    <router-outlet />
  `,
  styleUrls: ['app.component.scss'],
})
export class AppComponent {}
