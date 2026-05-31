import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinTEnantEntry } from './join-tenant-entry';

describe('JoinTEnantEntry', () => {
  let component: JoinTEnantEntry;
  let fixture: ComponentFixture<JoinTEnantEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinTEnantEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinTEnantEntry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
