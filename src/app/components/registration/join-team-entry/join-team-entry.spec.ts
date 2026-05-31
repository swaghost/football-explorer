import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinTeamEntry } from './join-team-entry';

describe('JoinTeamEntry', () => {
  let component: JoinTeamEntry;
  let fixture: ComponentFixture<JoinTeamEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinTeamEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinTeamEntry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
