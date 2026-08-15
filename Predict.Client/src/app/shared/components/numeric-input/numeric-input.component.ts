import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'p-numeric-input',
  templateUrl: './numeric-input.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./numeric-input.component.scss'],
})
export class NumericInputComponent {
  @Input() label = '';
  @Input() value: number | null = null;
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<number | null>();

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let newValue = input.value === '' ? null : Number(input.value);

    if (newValue !== null && isNaN(newValue)) {
      newValue = null;
    }

    this.value = newValue;
    this.valueChange.emit(newValue);
  }

  onBlur(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.value !== '' && !isNaN(Number(input.value))) {
      const numValue = Number(input.value);
      const formatted = Math.round(numValue * 100) / 100;
      if (formatted !== numValue) {
        this.value = formatted;
        this.valueChange.emit(formatted);
      }
    }
  }
}
