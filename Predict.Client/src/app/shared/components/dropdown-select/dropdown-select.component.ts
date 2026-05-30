import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'p-dropdown-select',
  templateUrl: './dropdown-select.component.html',
  styleUrls: ['./dropdown-select.component.scss'],
  imports: [NgbDropdownModule, FormsModule],
})
export class DropdownSelectComponent {
  @Input({ required: true }) items: string[] = [];
  @Input() selectedItem: string = '';
  @Input() placeholder = 'Select';

  @Output() selectionChange = new EventEmitter<string>();

  searchTerm: string = '';
  isOpen: boolean = false;

  selectItem(item: string) {
    this.selectedItem = item;
    this.selectionChange.emit(item);
    this.searchTerm = '';
    this.isOpen = false;
  }

  filteredItems() {
    if (!this.searchTerm || this.searchTerm === '') return this.items;
    return this.items.filter((item) =>
      item.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }

  onOpenChange(isOpen: boolean) {
    this.isOpen = isOpen;
    if (!isOpen) {
      this.searchTerm = '';
    }
  }
}
