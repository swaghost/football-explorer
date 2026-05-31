import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionDetails } from './subscription-details';

describe('SubscriptionDetails', () => {
  let component: SubscriptionDetails;
  let fixture: ComponentFixture<SubscriptionDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
