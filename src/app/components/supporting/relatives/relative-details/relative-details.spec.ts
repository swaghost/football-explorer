import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelativeDetails } from './relative-details';

describe('RelativeDetails', () => {
  let component: RelativeDetails;
  let fixture: ComponentFixture<RelativeDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelativeDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelativeDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
