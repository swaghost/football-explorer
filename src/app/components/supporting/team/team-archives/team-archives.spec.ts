import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamArchives } from './team-archives';

describe('TeamArchives', () => {
  let component: TeamArchives;
  let fixture: ComponentFixture<TeamArchives>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamArchives]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamArchives);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
