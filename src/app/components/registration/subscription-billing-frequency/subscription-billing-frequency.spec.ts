import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionBillingFrequency } from './subscription-billing-frequency';

describe('SubscriptionBillingFrequency', () => {
  let component: SubscriptionBillingFrequency;
  let fixture: ComponentFixture<SubscriptionBillingFrequency>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionBillingFrequency]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionBillingFrequency);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
