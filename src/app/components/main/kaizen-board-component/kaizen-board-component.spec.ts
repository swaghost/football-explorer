import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KaizenBoardComponent } from './kaizen-board-component';

describe('KaizenBoardComponent', () => {
  let component: KaizenBoardComponent;
  let fixture: ComponentFixture<KaizenBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KaizenBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KaizenBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
