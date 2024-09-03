import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioSelectorComponent } from './formulario-selector.component';

describe('FormularioSelectorComponent', () => {
  let component: FormularioSelectorComponent;
  let fixture: ComponentFixture<FormularioSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormularioSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
