import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionTierEditor } from './subscription-tier-editor';

describe('SubscriptionTierEditor', () => {
  let component: SubscriptionTierEditor;
  let fixture: ComponentFixture<SubscriptionTierEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionTierEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionTierEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
