import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ExampleRadialRemake } from './d3-example-radial-remake';

describe('D3ExampleRadialRemake', () => {
  let component: D3ExampleRadialRemake;
  let fixture: ComponentFixture<D3ExampleRadialRemake>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D3ExampleRadialRemake]
    })
    .compileComponents();

    fixture = TestBed.createComponent(D3ExampleRadialRemake);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
