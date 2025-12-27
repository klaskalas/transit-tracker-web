import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Observable, map } from 'rxjs';
import { FilterDialogComponent } from '../filter-dialog/filter-dialog.component';
import {RouteViewerComponent} from './route-viewer/route-viewer';
import {TransitLineCardComponent} from './transit-line-card/transit-line-card.component';
import {AsyncPipe, CommonModule, DOCUMENT} from '@angular/common';
import {FilterOptions, TransitLine} from '../../models/transit.model';
import {RouteType} from '../../models/enums';
import {TransitService} from '../../services/transit.service';
import {DialogService, DynamicDialogRef} from 'primeng/dynamicdialog';
import {SearchFilterPanelComponent} from './search-filter-panel/search-filter-panel.component';
import {RouteService} from '../../services/route-service';
import {Router} from '@angular/router';

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
export class MapComponent implements OnInit, OnDestroy {
  transitLines$: Observable<TransitLine[]>;
  currentFilters: FilterOptions = {
    types: [],
    regions: [],
    completionStatus: 'all'
  };
  dialogRef: DynamicDialogRef | undefined;
  searchTerm = '';
  selectedType = 'all';
  viewMode: 'map' | 'explore' = 'explore';
  isListExpanded = false;
  isNavHidden = false;
  selectedLine: TransitLine | null = null;
  typeOptions = [
    { label: 'Metro', value: 'metro' },
    { label: 'Bus', value: 'bus' },
    { label: 'Tram', value: 'tram' },
    { label: 'Train', value: 'train' },
  ];

  constructor(
    private transitService: TransitService,
    public dialog: DialogService,
    private routeService: RouteService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.transitLines$ = this.transitService.transitLines$;
  }

  ngOnInit(): void {
    this.renderer.addClass(this.document.body, 'map-mode');
    this.applyFilters();
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'map-mode');
    this.renderer.removeClass(this.document.body, 'nav-hidden');
  }

  openFilterDialog(): void {
    const dialogRef = this.dialog.open(FilterDialogComponent, {
      header: '',
      styleClass: 'alltrails-filter',
      showHeader: false,
      width: '420px',
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
    const typeFilters = this.getQuickTypeFilters();

    this.currentFilters = {
      types: typeFilters.length ? typeFilters : this.currentFilters.types,
      regions: this.currentFilters.regions,
      completionStatus: this.currentFilters.completionStatus
    };

    const searchTerm = this.searchTerm.trim().toLowerCase();

    this.transitLines$ = this.transitService.getFilteredTransitLines(this.currentFilters).pipe(
      map(lines => lines.filter(line => {
        const matchesSearch = !searchTerm || this.matchesSearch(line, searchTerm);
        return matchesSearch;
      }))
    );
  }

  onLineToggle(lineId: number): void {
    this.transitService.toggleLineCompletion(lineId);
  }

  onLineSelected(line: TransitLine): void {
    if (this.viewMode === 'map') {
      this.selectedLine = line;
      this.routeService.setSelectedRoute(line.id);
      return;
    }
    this.router.navigate(['lines', line.id]);
  }

  clearSelectedLine(): void {
    this.selectedLine = null;
    this.routeService.clearSelectedRoute();
  }

  setViewMode(mode: 'map' | 'explore'): void {
    this.viewMode = mode;
    if (mode === 'explore') {
      this.selectedLine = null;
      this.routeService.clearSelectedRoute();
    }
  }

  toggleListExpanded(): void {
    this.isListExpanded = !this.isListExpanded;
  }

  toggleNavVisibility(): void {
    this.isNavHidden = !this.isNavHidden;
    if (this.isNavHidden) {
      this.renderer.addClass(this.document.body, 'nav-hidden');
    } else {
      this.renderer.removeClass(this.document.body, 'nav-hidden');
    }
  }

  private getQuickTypeFilters(): RouteType[] {
    switch (this.selectedType) {
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

  // City/region filtering is handled in the filter dialog.
}
