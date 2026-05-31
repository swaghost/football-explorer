import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonsAssignedByMe } from './lessons-assigned-by-me';

describe('LessonsAssignedByMe', () => {
  let component: LessonsAssignedByMe;
  let fixture: ComponentFixture<LessonsAssignedByMe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonsAssignedByMe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonsAssignedByMe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
