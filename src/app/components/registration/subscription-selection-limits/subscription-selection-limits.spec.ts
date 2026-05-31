import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionSelectionLimits } from './subscription-selection-limits';

describe('SubscriptionSelectionLimits', () => {
  let component: SubscriptionSelectionLimits;
  let fixture: ComponentFixture<SubscriptionSelectionLimits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionSelectionLimits]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionSelectionLimits);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
