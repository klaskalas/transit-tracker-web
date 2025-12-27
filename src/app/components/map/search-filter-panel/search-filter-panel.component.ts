import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {IconDefinition} from '@fortawesome/angular-fontawesome';
import {faBusSimple, faTrain, faTrainSubway, faTrainTram} from '@fortawesome/free-solid-svg-icons';

type OptionItem = { label: string; value: string };

@Component({
  selector: 'app-search-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    FontAwesomeModule,
  ],
  templateUrl: './search-filter-panel.component.html',
  styleUrls: ['./search-filter-panel.component.scss']
})
export class SearchFilterPanelComponent {
  @Input() searchTerm = '';
  @Output() searchTermChange = new EventEmitter<string>();

  @Input() selectedType = 'all';
  @Output() selectedTypeChange = new EventEmitter<string>();

  @Output() filterClick = new EventEmitter<void>();

  @Input() typeOptions: OptionItem[] = [];

  readonly typeIcons: Record<string, IconDefinition> = {
    metro: faTrainSubway,
    bus: faBusSimple,
    tram: faTrainTram,
    train: faTrain
  };

  onSearchTermChange(value: string): void {
    this.searchTerm = value;
    this.searchTermChange.emit(value);
  }

  onSelectedTypeChange(value: string): void {
    this.selectedType = value;
    this.selectedTypeChange.emit(value);
  }

  openFilters(): void {
    this.filterClick.emit();
  }
}
