import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ExampleHexGrid } from './d3-example-hex-grid';

describe('D3ExampleHexGrid', () => {
  let component: D3ExampleHexGrid;
  let fixture: ComponentFixture<D3ExampleHexGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D3ExampleHexGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(D3ExampleHexGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
