import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamVisits } from './team-visits';

describe('TeamVisits', () => {
  let component: TeamVisits;
  let fixture: ComponentFixture<TeamVisits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamVisits]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamVisits);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
