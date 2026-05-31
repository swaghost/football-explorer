import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ExampleRadarChart } from './d3-example-radar-chart';

describe('D3ExampleRadarChart', () => {
  let component: D3ExampleRadarChart;
  let fixture: ComponentFixture<D3ExampleRadarChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D3ExampleRadarChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(D3ExampleRadarChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
