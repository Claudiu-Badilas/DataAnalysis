import { Component, EventEmitter, Input, Output, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'p-toggle-button-actions',
  imports: [],
  templateUrl: './toggle-button-actions.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './toggle-button-actions.component.scss',
})
export class ToggleButtonActionsComponent {
  @Input({ required: true }) options: string[] = [];
  @Input() set selected(value: string | null) {
    this._selected.set(!!value ? value : this.options[0]);
  }
  @Output() selectionChange = new EventEmitter<string>();

  _selected = signal<string | null>(null);

  select(tab: string) {
    this._selected.set(tab);
    this.selectionChange.emit(tab);
  }
}
