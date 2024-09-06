import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportModalComponentComponent } from './report-modal-component.component';

describe('ReportModalComponentComponent', () => {
  let component: ReportModalComponentComponent;
  let fixture: ComponentFixture<ReportModalComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportModalComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportModalComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
