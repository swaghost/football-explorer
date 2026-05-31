import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionBillingAddress } from './subscription-billing-address';

describe('SubscriptionBillingAddress', () => {
  let component: SubscriptionBillingAddress;
  let fixture: ComponentFixture<SubscriptionBillingAddress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionBillingAddress]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionBillingAddress);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
