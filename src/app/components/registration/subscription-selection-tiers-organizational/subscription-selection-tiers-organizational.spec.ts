import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionSelectionTiersOrganizational } from './subscription-selection-tiers-organizational';

describe('SubscriptionSelectionTiersOrganizational', () => {
  let component: SubscriptionSelectionTiersOrganizational;
  let fixture: ComponentFixture<SubscriptionSelectionTiersOrganizational>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionSelectionTiersOrganizational]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionSelectionTiersOrganizational);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
