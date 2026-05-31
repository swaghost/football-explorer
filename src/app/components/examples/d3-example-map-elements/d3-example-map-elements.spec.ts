import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ExampleMapElements } from './d3-example-map-elements';

describe('D3ExampleMapElements', () => {
  let component: D3ExampleMapElements;
  let fixture: ComponentFixture<D3ExampleMapElements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D3ExampleMapElements]
    })
    .compileComponents();

    fixture = TestBed.createComponent(D3ExampleMapElements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
