import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { FilterDialogComponent } from '../filter-dialog/filter-dialog.component';
import {RouteViewerComponent} from './route-viewer/route-viewer';
import {TransitLineCardComponent} from './transit-line-card/transit-line-card.component';
import {AsyncPipe, CommonModule} from '@angular/common';
import {FilterOptions, TransitLine} from '../../models/transit.model';
import {RouteType} from '../../models/enums';
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

  applyFilters(): void {
    const typeFilters = this.getTypeFilters(this.selectedType);
    const completionStatus = this.getCompletionStatus(this.collectionStatus);

    this.currentFilters = {
      types: typeFilters,
      regions: [],
      completionStatus
    };

    const searchTerm = this.searchTerm.trim().toLowerCase();
    const selectedCity = this.selectedCity.toLowerCase();

    this.transitLines$ = this.transitService.getFilteredTransitLines(this.currentFilters).pipe(
      map(lines => lines.filter(line => {
        const matchesSearch = !searchTerm || this.matchesSearch(line, searchTerm);
        const matchesCity = selectedCity === 'all' || this.matchesCity(line, selectedCity);
        return matchesSearch && matchesCity;
      }))
    );
  }

  onLineToggle(lineId: number): void {
    this.transitService.toggleLineCompletion(lineId);
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  private getCompletionStatus(status: 'all' | 'collected' | 'notCollected'): 'all' | 'completed' | 'incomplete' {
    if (status === 'collected') {
      return 'completed';
    }
    if (status === 'notCollected') {
      return 'incomplete';
    }
    return 'all';
  }

  private getTypeFilters(selectedType: string): RouteType[] {
    switch (selectedType) {
      case 'metro':
        return [RouteType.Metro, RouteType.Underground, RouteType.UrbanRailway];
      case 'bus':
        return [RouteType.BusService, RouteType.LocalBus, RouteType.ExpressBus, RouteType.RegionalBus];
      case 'tram':
        return [RouteType.TramService, RouteType.CityTram, RouteType.LocalTram, RouteType.RegionalTram];
      case 'train':
        return [RouteType.RailwayService, RouteType.RegionalRail, RouteType.SuburbanRailway, RouteType.InterRegionalRail];
      default:
        return [];
    }
  }

  private matchesSearch(line: TransitLine, searchTerm: string): boolean {
    const haystack = [
      line.shortName,
      line.longName,
      line.gtfsRouteId,
      line.region,
      line.agency?.name,
      line.agency?.countryCode
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(searchTerm);
  }

  private matchesCity(line: TransitLine, selectedCity: string): boolean {
    if (!selectedCity || selectedCity === 'all') {
      return true;
    }

    const regionValue = (line.region || '').toLowerCase();
    const agencyName = (line.agency?.name || '').toLowerCase();
    return regionValue.includes(selectedCity) || agencyName.includes(selectedCity);
  }
}
