import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinTenantConfirmation } from './join-tenant-confirmation';

describe('JoinTenantConfirmation', () => {
  let component: JoinTenantConfirmation;
  let fixture: ComponentFixture<JoinTenantConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinTenantConfirmation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinTenantConfirmation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
