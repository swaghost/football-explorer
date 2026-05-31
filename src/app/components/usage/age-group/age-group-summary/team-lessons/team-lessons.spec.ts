import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamLessons } from './team-lessons';

describe('TeamLessons', () => {
  let component: TeamLessons;
  let fixture: ComponentFixture<TeamLessons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamLessons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamLessons);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
