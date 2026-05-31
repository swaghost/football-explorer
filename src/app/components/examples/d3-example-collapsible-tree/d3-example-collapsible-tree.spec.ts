import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ExampleCollapsibleTree } from './d3-example-collapsible-tree';

describe('D3ExampleCollapsibleTree', () => {
  let component: D3ExampleCollapsibleTree;
  let fixture: ComponentFixture<D3ExampleCollapsibleTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D3ExampleCollapsibleTree]
    })
    .compileComponents();

    fixture = TestBed.createComponent(D3ExampleCollapsibleTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
