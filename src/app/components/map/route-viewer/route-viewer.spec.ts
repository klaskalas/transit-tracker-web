import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouteViewerComponent } from './route-viewer';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RouteViewerComponent', () => {
  let component: RouteViewerComponent;
  let fixture: ComponentFixture<RouteViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteViewerComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
