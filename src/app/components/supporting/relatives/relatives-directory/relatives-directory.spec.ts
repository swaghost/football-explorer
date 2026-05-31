import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelativesDirectory } from './relatives-directory';

describe('RelativesDirectory', () => {
  let component: RelativesDirectory;
  let fixture: ComponentFixture<RelativesDirectory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelativesDirectory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelativesDirectory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
