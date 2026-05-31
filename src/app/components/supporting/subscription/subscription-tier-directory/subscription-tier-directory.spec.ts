import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionTierDirectory } from './subscription-tier-directory';

describe('SubscriptionTierDirectory', () => {
  let component: SubscriptionTierDirectory;
  let fixture: ComponentFixture<SubscriptionTierDirectory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionTierDirectory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionTierDirectory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
