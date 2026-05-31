import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'p-transaction',
  imports: [CommonModule, CommonModule, RouterModule],
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent {}
