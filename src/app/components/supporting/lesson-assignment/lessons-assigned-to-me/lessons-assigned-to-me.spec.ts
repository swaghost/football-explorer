import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonsAssignedToMe } from './lessons-assigned-to-me';

describe('LessonsAssignedToMe', () => {
  let component: LessonsAssignedToMe;
  let fixture: ComponentFixture<LessonsAssignedToMe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonsAssignedToMe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonsAssignedToMe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
