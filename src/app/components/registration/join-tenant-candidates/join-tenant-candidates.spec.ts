import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinTenantCandidates } from './join-tenant-candidates';

describe('JoinTenantCandidates', () => {
  let component: JoinTenantCandidates;
  let fixture: ComponentFixture<JoinTenantCandidates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinTenantCandidates]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinTenantCandidates);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
