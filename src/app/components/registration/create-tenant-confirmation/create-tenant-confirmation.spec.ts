import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTenantConfirmation } from './create-tenant-confirmation';

describe('CreateTenantConfirmation', () => {
  let component: CreateTenantConfirmation;
  let fixture: ComponentFixture<CreateTenantConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTenantConfirmation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTenantConfirmation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
