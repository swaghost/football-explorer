import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonEditor } from './lesson-editor';

describe('LessonEditor', () => {
  let component: LessonEditor;
  let fixture: ComponentFixture<LessonEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
