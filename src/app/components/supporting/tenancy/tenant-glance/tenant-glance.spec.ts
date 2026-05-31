import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantGlance } from './tenant-glance';

describe('TenantGlance', () => {
  let component: TenantGlance;
  let fixture: ComponentFixture<TenantGlance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantGlance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantGlance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
