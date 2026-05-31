import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ExampleDragRotate } from './d3-example-drag-rotate';

describe('D3ExampleDragRotate', () => {
  let component: D3ExampleDragRotate;
  let fixture: ComponentFixture<D3ExampleDragRotate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D3ExampleDragRotate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(D3ExampleDragRotate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
