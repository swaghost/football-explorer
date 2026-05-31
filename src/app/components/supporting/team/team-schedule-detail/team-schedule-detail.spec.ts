import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamScheduleDetail } from './team-schedule-detail';

describe('TeamScheduleDetail', () => {
  let component: TeamScheduleDetail;
  let fixture: ComponentFixture<TeamScheduleDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamScheduleDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamScheduleDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
