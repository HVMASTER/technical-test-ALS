import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormService } from './services/form.service';
import { tap } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
  informes: any[] = [];
  selectedInforme: any = null;
  informeForm: FormGroup;

  constructor(
    private formService: FormService,
    private _cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
  ) {
      this.informeForm = this.formBuilder.group({
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

  ngOnInit(): void {
    this.getNumeroInformes();
  }

  getNumeroInformes(): void {
    this.formService.getInformesPuente().pipe(
      tap((data: any[]) => {
        this.informes = data;
        this._cdr.markForCheck();
      })
    ).subscribe({
      error: (error) => {
        console.log('Error: ' + error);
      }
    });
  }

  selectInforme(informe: any): void {
    this.selectedInforme = {
      ...informe,
      fechaInspeccion: this.formatDate(informe.fechaInspeccion),
      fechaEmision: this.formatDate(informe.fechaEmision)
    };
    this.informeForm.patchValue(this.selectedInforme);
  }

  deselectInforme(): void {
    this.selectedInforme = null;
  }

  formatDate(date: string | null): string {
    if (date === null) {
      return '';
    }
    return this.datePipe.transform(date!, 'dd-MM-yyyy')!;
  }
}
