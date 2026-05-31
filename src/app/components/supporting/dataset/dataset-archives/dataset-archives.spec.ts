import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetArchives } from './dataset-archives';

describe('DatasetArchives', () => {
  let component: DatasetArchives;
  let fixture: ComponentFixture<DatasetArchives>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetArchives]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatasetArchives);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
