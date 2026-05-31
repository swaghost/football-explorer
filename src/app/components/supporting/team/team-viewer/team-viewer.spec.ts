import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamViewer } from './team-viewer';

describe('TeamViewer', () => {
  let component: TeamViewer;
  let fixture: ComponentFixture<TeamViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
