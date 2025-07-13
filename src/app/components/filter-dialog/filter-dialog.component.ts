import {Component, inject} from '@angular/core';
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {FilterOptions, TransitType} from '../../models/transit.model';
import {Checkbox} from 'primeng/checkbox';
import {Select} from 'primeng/select';
import {ButtonDirective} from 'primeng/button';
import {FormsModule} from '@angular/forms';
import {Divider} from 'primeng/divider';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-filter-dialog',
  standalone: true,
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.scss'],
  imports: [
    CommonModule,
    Checkbox,
    Select,
    ButtonDirective,
    FormsModule,
    Divider
  ],
  providers: [DialogService]
})
export class FilterDialogComponent {
  filters: FilterOptions;

  transitTypes: { value: TransitType; label: string }[] = [
    { value: 'train', label: 'Train' },
    { value: 'tram', label: 'Tram' },
    { value: 'metro', label: 'Metro' },
    { value: 'bus', label: 'Bus' }
  ];

  regions: string[] = ['Stockholm', 'Tokyo', 'London', 'New York', 'Paris'];

  completionOptions = [
    { value: 'all', label: 'All Lines' },
    { value: 'completed', label: 'Completed Only' },
    { value: 'incomplete', label: 'Incomplete Only' }
  ];

  config = inject(DynamicDialogConfig);
  dialogRef = inject(DynamicDialogRef);

  constructor() {
    this.filters = this.config.data;
  }

  onTypeChange(type: TransitType, checked: boolean): void {
    if (checked) {
      if (!this.filters.types.includes(type)) {
        this.filters.types.push(type);
      }
    } else {
      this.filters.types = this.filters.types.filter(t => t !== type);
    }
  }

  onRegionChange(region: string, checked: boolean): void {
    if (checked) {
      if (!this.filters.regions.includes(region)) {
        this.filters.regions.push(region);
      }
    } else {
      this.filters.regions = this.filters.regions.filter(r => r !== region);
    }
  }

  isTypeSelected(type: TransitType): boolean {
    return this.filters.types.includes(type);
  }

  isRegionSelected(region: string): boolean {
    return this.filters.regions.includes(region);
  }

  clearFilters(): void {
    this.filters = {
      types: [],
      regions: [],
      completionStatus: 'all'
    };
  }

  applyFilters(): void {
    this.dialogRef.close(this.filters);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
