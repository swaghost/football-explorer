import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinTenantTeamViaCode } from './join-tenant-team-via-code';

describe('JoinTenantTeamViaCode', () => {
  let component: JoinTenantTeamViaCode;
  let fixture: ComponentFixture<JoinTenantTeamViaCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinTenantTeamViaCode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinTenantTeamViaCode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
