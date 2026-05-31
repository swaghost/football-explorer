import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionSelectionUsageMode } from './subscription-selection-usage-mode';

describe('SubscriptionSelectionUsageMode', () => {
  let component: SubscriptionSelectionUsageMode;
  let fixture: ComponentFixture<SubscriptionSelectionUsageMode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionSelectionUsageMode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionSelectionUsageMode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
