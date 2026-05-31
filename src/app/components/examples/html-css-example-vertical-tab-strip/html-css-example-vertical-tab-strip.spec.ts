import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlCssExampleVerticalTabStrip } from './html-css-example-vertical-tab-strip';

describe('HtmlCssExampleVerticalTabStrip', () => {
  let component: HtmlCssExampleVerticalTabStrip;
  let fixture: ComponentFixture<HtmlCssExampleVerticalTabStrip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HtmlCssExampleVerticalTabStrip]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HtmlCssExampleVerticalTabStrip);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
