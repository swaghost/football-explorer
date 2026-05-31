import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffImporter } from './staff-importer';

describe('StaffImporter', () => {
  let component: StaffImporter;
  let fixture: ComponentFixture<StaffImporter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffImporter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffImporter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
