import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoanService_STORAGE_KEY } from 'src/app/modules/loan/services/loan.service';
import { LoanSettingsService } from 'src/app/modules/loan/services/loan-settings.service';
import { ReceiptsService_STORAGE_KEY } from 'src/app/modules/receipts/services/receipts.service';
import { TransactionService_STORAGE_KEY } from 'src/app/modules/transaction/services/transaction.service';
import { SuccessModalComponent } from 'src/app/shared/components/modals/success-modal/success-modal.component';

@Component({
  selector: 'p-loan-settings',
  imports: [CommonModule],
  templateUrl: './loan-settings.component.html',
  styleUrls: ['./loan-settings.component.scss'],
})
export class LoanSettingsComponent implements OnInit {
  private settingsService = inject(LoanSettingsService);
  private modalService = inject(NgbModal);

  storageKeys: {
    key: string;
    storageType: 'local' | 'session';
  }[] = [];

  ngOnInit(): void {
    this.loadKeys();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.settingsService
      .uploadStorageItemFromJson(LoanService_STORAGE_KEY, file)
      .then(() => {
        this.loadKeys();
        this.openSuccessModal('File uploaded successfully!');
      })
      .catch((error) => alert(`Error: ${error.message}`));
  }

  // ✅ SUCCESS MODAL
  private openSuccessModal(message: string) {
    const modalRef = this.modalService.open(SuccessModalComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: true,
    });

    modalRef.componentInstance.message = message;
  }

  loadKeys(): void {
    this.storageKeys = [];
    const ignoredKey = [
      TransactionService_STORAGE_KEY,
      ReceiptsService_STORAGE_KEY,
    ];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !ignoredKey.some((k) => key === k)) {
        this.storageKeys.push({ key, storageType: 'local' });
      }
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && !ignoredKey.some((k) => key === k)) {
        this.storageKeys.push({ key, storageType: 'session' });
      }
    }
  }

  removeItem(item: { key: string; storageType: 'local' | 'session' }): void {
    const storage =
      item.storageType === 'local' ? localStorage : sessionStorage;

    storage.removeItem(item.key);
    this.loadKeys();
  }

  downloadItem(item: { key: string; storageType: 'local' | 'session' }): void {
    this.settingsService.downloadItem(item);
  }
}
