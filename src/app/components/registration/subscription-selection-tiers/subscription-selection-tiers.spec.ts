import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionSelectionTiers } from './subscription-selection-tiers';

describe('SubscriptionSelectionTiers', () => {
  let component: SubscriptionSelectionTiers;
  let fixture: ComponentFixture<SubscriptionSelectionTiers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionSelectionTiers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionSelectionTiers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
