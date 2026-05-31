import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffEditor } from './staff-editor';

describe('StaffEditor', () => {
  let component: StaffEditor;
  let fixture: ComponentFixture<StaffEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
