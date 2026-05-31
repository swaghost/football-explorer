import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffArchives } from './staff-archives';

describe('StaffArchives', () => {
  let component: StaffArchives;
  let fixture: ComponentFixture<StaffArchives>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffArchives]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffArchives);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
