import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptonEditor } from './subscripton-editor';

describe('SubscriptonEditor', () => {
  let component: SubscriptonEditor;
  let fixture: ComponentFixture<SubscriptonEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptonEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptonEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
