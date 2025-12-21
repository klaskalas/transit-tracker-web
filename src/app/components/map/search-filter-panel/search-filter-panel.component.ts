import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {SelectModule} from 'primeng/select';
import {SelectButtonModule} from 'primeng/selectbutton';
import {ButtonModule} from 'primeng/button';

type OptionItem = { label: string; value: string };

@Component({
  selector: 'app-search-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    SelectButtonModule,
    ButtonModule,
  ],
  templateUrl: './search-filter-panel.component.html',
  styleUrls: ['./search-filter-panel.component.scss']
})
export class SearchFilterPanelComponent {
  @Input() searchTerm = '';
  @Output() searchTermChange = new EventEmitter<string>();

  @Input() selectedCity = 'all';
  @Output() selectedCityChange = new EventEmitter<string>();

  @Input() selectedType = 'all';
  @Output() selectedTypeChange = new EventEmitter<string>();

  @Input() collectionStatus: 'all' | 'collected' | 'notCollected' = 'all';
  @Output() collectionStatusChange = new EventEmitter<'all' | 'collected' | 'notCollected'>();

  @Input() viewMode: 'grid' | 'list' = 'grid';
  @Output() viewModeChange = new EventEmitter<'grid' | 'list'>();

  @Input() cityOptions: OptionItem[] = [];
  @Input() typeOptions: OptionItem[] = [];
  @Input() collectionOptions: OptionItem[] = [];

  onSearchTermChange(value: string): void {
    this.searchTerm = value;
    this.searchTermChange.emit(value);
  }

  onSelectedCityChange(value: string): void {
    this.selectedCity = value;
    this.selectedCityChange.emit(value);
  }

  onSelectedTypeChange(value: string): void {
    this.selectedType = value;
    this.selectedTypeChange.emit(value);
  }

  onCollectionStatusChange(value: 'all' | 'collected' | 'notCollected'): void {
    this.collectionStatus = value;
    this.collectionStatusChange.emit(value);
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
    this.viewModeChange.emit(mode);
  }
}
