import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ExampleSunburst } from './d3-example-sunburst';

describe('D3ExampleSunburst', () => {
  let component: D3ExampleSunburst;
  let fixture: ComponentFixture<D3ExampleSunburst>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D3ExampleSunburst]
    })
    .compileComponents();

    fixture = TestBed.createComponent(D3ExampleSunburst);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
