import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionAddOnEditor } from './subscription-add-on-editor';

describe('SubscriptionAddOnEditor', () => {
  let component: SubscriptionAddOnEditor;
  let fixture: ComponentFixture<SubscriptionAddOnEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionAddOnEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionAddOnEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
