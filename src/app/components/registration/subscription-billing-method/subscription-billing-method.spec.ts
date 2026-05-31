import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionBillingMethod } from './subscription-billing-method';

describe('SubscriptionBillingMethod', () => {
  let component: SubscriptionBillingMethod;
  let fixture: ComponentFixture<SubscriptionBillingMethod>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionBillingMethod]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionBillingMethod);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
