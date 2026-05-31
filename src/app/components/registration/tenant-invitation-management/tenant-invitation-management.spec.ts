import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantInvitationManagement } from './tenant-invitation-management';

describe('TenantInvitationManagement', () => {
  let component: TenantInvitationManagement;
  let fixture: ComponentFixture<TenantInvitationManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantInvitationManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantInvitationManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
