import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionAddOnDirectory } from './subscription-add-on-directory';

describe('SubscriptionAddOnDirectory', () => {
  let component: SubscriptionAddOnDirectory;
  let fixture: ComponentFixture<SubscriptionAddOnDirectory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionAddOnDirectory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionAddOnDirectory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
