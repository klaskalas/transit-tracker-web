import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteViewer } from './route-viewer';

describe('RouteViewer', () => {
  let component: RouteViewer;
  let fixture: ComponentFixture<RouteViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
