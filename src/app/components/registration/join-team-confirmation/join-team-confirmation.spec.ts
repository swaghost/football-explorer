import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinTeamConfirmation } from './join-team-confirmation';

describe('JoinTeamConfirmation', () => {
  let component: JoinTeamConfirmation;
  let fixture: ComponentFixture<JoinTeamConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinTeamConfirmation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinTeamConfirmation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
