import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReceiptDomain } from '../../../models/receipts-domain.model';

@Component({
  selector: 'p-receipts-list',
  imports: [CommonModule],
  templateUrl: './receipts-list.component.html',
  styleUrl: './receipts-list.component.scss',
})
export class ReceiptListComponent {
  @Input() receipts: ReceiptDomain[] = [];

  expandedId: number | null = null;

  toggle(id: number) {
    if (this.expandedId === id) {
      this.expandedId = null;
    } else {
      this.expandedId = id;
    }
  }
}
