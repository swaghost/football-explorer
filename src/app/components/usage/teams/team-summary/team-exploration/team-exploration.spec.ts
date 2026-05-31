import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamExploration } from './team-exploration';

describe('TeamExploration', () => {
  let component: TeamExploration;
  let fixture: ComponentFixture<TeamExploration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamExploration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamExploration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
