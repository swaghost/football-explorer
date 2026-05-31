import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonDirectory } from './lesson-directory';

describe('LessonDirectory', () => {
  let component: LessonDirectory;
  let fixture: ComponentFixture<LessonDirectory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonDirectory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonDirectory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
