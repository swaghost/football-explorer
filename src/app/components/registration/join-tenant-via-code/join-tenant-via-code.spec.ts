import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinTenantViaCode } from './join-tenant-via-code';

describe('JoinTenantViaCode', () => {
  let component: JoinTenantViaCode;
  let fixture: ComponentFixture<JoinTenantViaCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinTenantViaCode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinTenantViaCode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
