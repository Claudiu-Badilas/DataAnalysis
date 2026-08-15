import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HoldTriggerDirective } from '../../directives/hold-trigger.directive';
import { TripleClickDirective } from '../../directives/triple-click.directive';

@Component({
  selector: 'p-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, TripleClickDirective, HoldTriggerDirective],
})
export class SideBarComponent implements OnInit {
  isFullSize = true;

  ngOnInit() {
    // Close sidebar by default on mobile (screen width <= 768px)
    if (window.innerWidth <= 768) {
      this.isFullSize = false;
    }
  }

  toggleSidebar() {
    this.isFullSize = !this.isFullSize;
  }
}
