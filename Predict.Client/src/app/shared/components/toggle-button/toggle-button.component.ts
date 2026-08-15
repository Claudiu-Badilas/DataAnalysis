import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'p-toggle-button',
  imports: [NgClass],
  templateUrl: './toggle-button.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './toggle-button.component.scss',
})
export class ToggleButtonComponent {
  @Input({ required: true }) options: { label: string; iconPath?: string }[] =
    [];
  @Input() set selected(value: string | null) {
    this._selected.set(!!value ? value : this.options[0].label);
  }
  @Input() gradient: { primaryColor: string; secondaryColor: string };
  @Output() selectionChange = new EventEmitter<string>();

  _selected = signal<string | null>(null);

  select(option: string) {
    this._selected.set(option);
    this.selectionChange.emit(option);
  }

  get gradientStyle(): string {
    return `linear-gradient(135deg, ${this.gradient?.primaryColor ?? '#c61a54'}, ${this.gradient?.secondaryColor ?? '#d5a326'})`;
  }
}
