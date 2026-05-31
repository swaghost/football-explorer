import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionSelectionTiersPersonal } from './subscription-selection-tiers-personal';

describe('SubscriptionSelectionTiersPersonal', () => {
  let component: SubscriptionSelectionTiersPersonal;
  let fixture: ComponentFixture<SubscriptionSelectionTiersPersonal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionSelectionTiersPersonal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionSelectionTiersPersonal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
