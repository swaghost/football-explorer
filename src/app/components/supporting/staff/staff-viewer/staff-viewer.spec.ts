import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffViewer } from './staff-viewer';

describe('StaffViewer', () => {
  let component: StaffViewer;
  let fixture: ComponentFixture<StaffViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
