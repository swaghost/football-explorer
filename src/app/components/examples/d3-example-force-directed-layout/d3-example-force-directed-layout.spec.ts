import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ExampleForceDirectedLayout } from './d3-example-force-directed-layout';

describe('D3ExampleForceDirectedLayout', () => {
  let component: D3ExampleForceDirectedLayout;
  let fixture: ComponentFixture<D3ExampleForceDirectedLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D3ExampleForceDirectedLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(D3ExampleForceDirectedLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
