import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotographicSetModalComponent } from './photographic-set-modal.component';

describe('PhotographicSetModalComponent', () => {
  let component: PhotographicSetModalComponent;
  let fixture: ComponentFixture<PhotographicSetModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PhotographicSetModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotographicSetModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
