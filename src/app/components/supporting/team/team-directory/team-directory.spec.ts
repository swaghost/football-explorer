import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamDirectory } from './team-directory';

describe('TeamDirectory', () => {
  let component: TeamDirectory;
  let fixture: ComponentFixture<TeamDirectory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamDirectory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamDirectory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
