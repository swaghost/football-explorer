import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3ExampleNationMapperComponent } from './d3-example-nation-mapper.component';

describe('D3ExampleNationMapperComponent', () => {
  let component: D3ExampleNationMapperComponent;
  let fixture: ComponentFixture<D3ExampleNationMapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D3ExampleNationMapperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(D3ExampleNationMapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
