import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizationTester } from './visualization-tester';

describe('VisualizationTester', () => {
  let component: VisualizationTester;
  let fixture: ComponentFixture<VisualizationTester>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizationTester]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizationTester);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
