import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonArchives } from './lesson-archives';

describe('LessonArchives', () => {
  let component: LessonArchives;
  let fixture: ComponentFixture<LessonArchives>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonArchives]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonArchives);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
