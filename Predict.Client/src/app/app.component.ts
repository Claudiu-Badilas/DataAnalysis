import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastNotificationComponent } from './platform/toast-notifications/toast-notification.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { VersionBannerComponent } from './shared/components/version-banner/version-banner.component';
import { VersionService } from './shared/services/version.service';

@Component({
  selector: 'p-root',
  imports: [
    RouterModule,
    SpinnerComponent,
    ToastNotificationComponent,
    VersionBannerComponent,
  ],
  providers: [VersionService],
  template: `
    <p-version-banner />
    <p-spinner />
    <p-toast />
    <router-outlet />
  `,
  styleUrls: ['app.component.scss'],
})
export class AppComponent {}
