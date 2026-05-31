import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionSelectionAddOns } from './subscription-selection-add-ons';

describe('SubscriptionSelectionAddOns', () => {
  let component: SubscriptionSelectionAddOns;
  let fixture: ComponentFixture<SubscriptionSelectionAddOns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionSelectionAddOns]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionSelectionAddOns);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
