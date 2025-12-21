import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FilterDialogComponent } from '../filter-dialog/filter-dialog.component';
import {RouteViewerComponent} from './route-viewer/route-viewer';
import {TransitLineCardComponent} from './transit-line-card/transit-line-card.component';
import {AsyncPipe, CommonModule} from '@angular/common';
import {FilterOptions, TransitLine} from '../../models/transit.model';
import {TransitService} from '../../services/transit.service';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {SearchFilterPanelComponent} from './search-filter-panel/search-filter-panel.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  imports: [
    CommonModule,
    RouteViewerComponent,
    TransitLineCardComponent,
    SearchFilterPanelComponent,
    AsyncPipe,
  ],
  styleUrls: ['./map.component.scss'],
  providers: [DialogService]
})
export class MapComponent implements OnInit {
  transitLines$: Observable<TransitLine[]>;
  currentFilters: FilterOptions = {
    types: [],
    regions: [],
    completionStatus: 'all'
  };
  dialogRef: DynamicDialogRef | undefined;
  searchTerm = '';
  selectedCity = 'all';
  selectedType = 'all';
  viewMode: 'grid' | 'list' = 'grid';
  collectionStatus: 'all' | 'collected' | 'notCollected' = 'all';
  cityOptions = [
    { label: 'All Cities', value: 'all' },
    { label: 'Stockholm', value: 'stockholm' },
    { label: 'London', value: 'london' },
    { label: 'Tokyo', value: 'tokyo' },
  ];
  typeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'Metro', value: 'metro' },
    { label: 'Bus', value: 'bus' },
    { label: 'Tram', value: 'tram' },
    { label: 'Train', value: 'train' },
  ];
  collectionOptions = [
    { label: 'All', value: 'all' },
    { label: 'Collected', value: 'collected' },
    { label: 'Not Collected', value: 'notCollected' },
  ];

  constructor(
    private transitService: TransitService,
    public dialog: DialogService
  ) {
    this.transitLines$ = this.transitService.transitLines$;
  }

  ngOnInit(): void {
    this.applyFilters();
  }

  openFilterDialog(): void {
    const dialogRef = this.dialog.open(FilterDialogComponent, {
      header: 'Filter Transit Lines',
      width: '350px',
      data: { filters: { ...this.currentFilters } }
    });

    dialogRef.onClose.subscribe(result => {
      if (result) {
        this.currentFilters = result;
        this.applyFilters();
      }
    });
  }

  private applyFilters(): void {
    this.transitLines$ = this.transitService.getFilteredTransitLines(this.currentFilters);
  }

  onLineToggle(lineId: string): void {
    this.transitService.toggleLineCompletion(lineId);
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }
}
