import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffDirectory } from './staff-directory';

describe('StaffDirectory', () => {
  let component: StaffDirectory;
  let fixture: ComponentFixture<StaffDirectory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffDirectory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffDirectory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
