import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamManager } from './team-manager';

describe('TeamManager', () => {
  let component: TeamManager;
  let fixture: ComponentFixture<TeamManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
