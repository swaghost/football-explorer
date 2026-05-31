import { ComponentFixture, TestBed } from '@angular/core/testing';

import { P5ExamplePopups } from './p5-example-popups';

describe('P5ExamplePopups', () => {
  let component: P5ExamplePopups;
  let fixture: ComponentFixture<P5ExamplePopups>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [P5ExamplePopups]
    })
    .compileComponents();

    fixture = TestBed.createComponent(P5ExamplePopups);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
