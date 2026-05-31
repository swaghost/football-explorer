import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinTeamCandidates } from './join-team-candidates';

describe('JoinTeamCandidates', () => {
  let component: JoinTeamCandidates;
  let fixture: ComponentFixture<JoinTeamCandidates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinTeamCandidates]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinTeamCandidates);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
