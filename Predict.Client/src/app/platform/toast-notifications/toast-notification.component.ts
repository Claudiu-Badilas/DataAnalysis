import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'p-toast',
  imports: [],
  template: ` <div class="card"></div> `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./toast-notification.component.scss'],
})
export class ToastNotificationComponent {}
