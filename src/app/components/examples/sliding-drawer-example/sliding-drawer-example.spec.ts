import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlidingDrawerExample } from './sliding-drawer-example';

describe('SlidingDrawerExample', () => {
  let component: SlidingDrawerExample;
  let fixture: ComponentFixture<SlidingDrawerExample>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlidingDrawerExample]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlidingDrawerExample);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
