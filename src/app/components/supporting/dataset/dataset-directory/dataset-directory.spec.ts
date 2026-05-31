import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetDirectory } from './dataset-directory';

describe('DatasetDirectory', () => {
  let component: DatasetDirectory;
  let fixture: ComponentFixture<DatasetDirectory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetDirectory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetDirectory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
