import { Component, Input, inject, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'p-success-modal',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Success</h5>
      <button
        type="button"
        class="btn-close"
        (click)="activeModal.dismiss()"
      ></button>
    </div>

    <div class="modal-body">
      {{ message }}
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" (click)="activeModal.dismiss()">
        Close
      </button>

      <button class="btn btn-primary" (click)="goToPage()">Continue</button>
    </div>
  `,
})
export class SuccessModalComponent {
  @Input() message = 'Operation completed successfully';

  activeModal = inject(NgbActiveModal);
  private router = inject(Router);

  goToPage() {
    this.activeModal.close();
    this.router.navigate(['/dashboard']); // change route as needed
  }
}
