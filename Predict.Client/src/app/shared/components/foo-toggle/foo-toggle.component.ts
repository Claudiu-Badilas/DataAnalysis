import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'p-foo-toggle',
  templateUrl: './foo-toggle.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './foo-toggle.component.scss',
})
export class FooToggleComponent {
  @Input() toggle: boolean = false;
  @Input() size: 'default' | 'xsmall' = 'default';
  @Output() toggleChange = new EventEmitter<boolean>();

  onToggle() {
    this.toggle = !this.toggle;
    this.toggleChange.emit(this.toggle);
  }
}
