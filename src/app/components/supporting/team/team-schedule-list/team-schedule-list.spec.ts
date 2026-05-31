import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamScheduleList } from './team-schedule-list';

describe('TeamScheduleList', () => {
  let component: TeamScheduleList;
  let fixture: ComponentFixture<TeamScheduleList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamScheduleList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamScheduleList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
