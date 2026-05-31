import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantSwitch } from './tenant-switch';

describe('TenantSwitch', () => {
  let component: TenantSwitch;
  let fixture: ComponentFixture<TenantSwitch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantSwitch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantSwitch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
