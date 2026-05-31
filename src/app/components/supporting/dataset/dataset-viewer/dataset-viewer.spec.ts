import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetViewer } from './dataset-viewer';

describe('DatasetViewer', () => {
  let component: DatasetViewer;
  let fixture: ComponentFixture<DatasetViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
