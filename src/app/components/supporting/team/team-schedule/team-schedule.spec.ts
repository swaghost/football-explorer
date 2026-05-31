import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSchedule } from './team-schedule';

describe('TeamSchedule', () => {
  let component: TeamSchedule;
  let fixture: ComponentFixture<TeamSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamSchedule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamSchedule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
