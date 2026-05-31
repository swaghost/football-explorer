import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelativeEditor } from './relative-editor';

describe('RelativeEditor', () => {
  let component: RelativeEditor;
  let fixture: ComponentFixture<RelativeEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelativeEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelativeEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
