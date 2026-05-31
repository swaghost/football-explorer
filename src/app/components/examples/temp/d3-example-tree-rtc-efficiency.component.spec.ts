import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ExampleTreeRtcEfficiencyComponent } from './d3-example-tree-rtc-efficiency.component';

describe('D3ExampleTreeRtcEfficiencyComponent', () => {
  let component: D3ExampleTreeRtcEfficiencyComponent;
  let fixture: ComponentFixture<D3ExampleTreeRtcEfficiencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D3ExampleTreeRtcEfficiencyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(D3ExampleTreeRtcEfficiencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
