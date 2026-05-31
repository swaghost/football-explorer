import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantEntry } from './tenant-entry';

describe('TenantEntry', () => {
  let component: TenantEntry;
  let fixture: ComponentFixture<TenantEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantEntry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
