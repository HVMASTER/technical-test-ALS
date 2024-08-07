import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormService } from './services/form.service';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Informe } from './interfaces/informe.interface';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit, OnDestroy {
  informes: Informe[] = [];
  selectedInforme: Informe | null = null;
  informeForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private formService: FormService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
  ) {
    this.informeForm = this.createFormGroup();
  }

  ngOnInit(): void {
    this.getNumeroInformes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createFormGroup(): FormGroup {
    return this.formBuilder.group({
      numeroInforme: [''],
      empresa: [''],
      persona: [''],
      equipo: [''],
      modelo: [''],
      marca: [''],
      polipasto1: [''],
      polipasto2: [''],
      polipasto3: [''],
      fechaFabricacion: [''],
      numeroSerie: [''],
      lugarInscripcion: [''],
      fechaInspeccion: [''],
      estado: ['']
    });
  }

  async getNumeroInformes() {
    await this.formService.getInformesPuente().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: Informe[]) => {
        this.informes = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching informes:', error);
      }
    });
  }

  selectInforme(informe: Informe) {
    this.formService.getInformesPuenteById(informe.idInforme).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: Informe) => {
        this.selectedInforme = {
          ...data,
          fechaFabricacion: this.formatDate(data.fechaFabricacion),
          fechaInspeccion: this.formatDate(data.fechaInspeccion),
        };
        this.informeForm.patchValue(this.selectedInforme);
      },
      error: (error) => {
        console.error('Error fetching informe details:', error);
      }
    });
  }

  deselectInforme() {
    this.selectedInforme = null;
    this.informeForm.reset();
    this.cdr.detectChanges();
  }

  formatDate(date: string | null): string {
    return date ? this.datePipe.transform(date, 'dd-MM-yyyy')! : '';
  }
}
