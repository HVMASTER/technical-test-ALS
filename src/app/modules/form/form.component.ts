import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormService } from './services/form.service';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  itemsWithStatus: any[] = [];
  itemsWithDetail: any[] = [];
  ganchos: any[] = [];
  descripcionItems: any[] = [];
  formHData: any;
  formH1Data: any;
  formH2Data: any;
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
      estado: [''],
      inspector: ['', Validators.required],
    });
  }

  async getNumeroInformes() {
    await this.formService.getRegistroFormPuente().pipe(
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
    this.formService.getInformePuenteByID(informe.idInforme).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: Informe) => {
        this.selectedInforme = {
          ...data,
          fechaFabricacion: this.formatDate(data.fechaFabricacion),
          fechaInspeccion: this.formatDate(data.fechaInspeccion),
        };
        this.informeForm.patchValue(this.selectedInforme);

        this.loadItemDetails(informe.idInforme);
        this.loadFormH(informe.idInforme);
        this.loadFormH1(informe.idInforme);
        this.loadFormH2(informe.idInforme);
      },
      error: (error) => {
        console.error('Error fetching informe details:', error);
      }
    });
  }

  private loadItemDetails(idInforme: number) {
    this.formService.getItemPuenteByIdInforme(idInforme).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (items) => {
        this.loadItemStatus(items);
        this.loadDetail(items);
        this.loadDescripcion(idInforme);

        setTimeout(() => {
          this.combineItemData();
        }, 500);
      },
      error: (error) => {
        console.error('Error fetching item data:', error);
      }
    });
  }

  private loadItemStatus(items: any[]) {
    this.formService.getStatus().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (statusList) => {
        this.itemsWithStatus = items.map(item => {
          const statusObj = statusList.find(status => status.idStatus === item.idStatus);
          return {
            ...item,
            status: statusObj?.status || 'N/A',
            alias: statusObj?.alias || 'N/A'
          };
        });
      },
      error: (error) => {
        console.error('Error fetching status:', error);
      }
    });
  }

  loadDetail(items: any[]) {
    this.formService.getDetalle().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (detailList) => {
        this.itemsWithDetail = items.map(item => {
          const detailObj = detailList.find(detail => detail.idDetalle === item.idDetalle);
          return {
            ...item,
            detalle: detailObj?.detalle || 'N/A'
          };
        });
      },
      error: (error) => {
        console.error('Error fetching detail:', error);
      }
    });
  }

  private combineItemData() {
    if (this.itemsWithStatus.length > 0 && this.itemsWithDetail.length > 0) {
      this.itemsWithStatus = this.itemsWithStatus.map(item => {
        const detailObj = this.itemsWithDetail.find(detail => detail.idItem === item.idItem);
        return {
          ...item,
          detalle: detailObj ? detailObj.detalle : 'N/A'
        };
      });
    }
  }

  private loadDescripcion(idInforme: number) {
    this.formService.getdescripcionPuenteByIdInforme(idInforme).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (descripcionItems) => {
        this.descripcionItems = descripcionItems.sort((a, b) => a.idDetalle - b.idDetalle);
      },
      error: (error) => {
        console.error('Error fetching descripcion data:', error);
      }
    });
  }

  getStatusLabel(idStatus: number): string {
    return idStatus === 2 ? 'N/C' : idStatus === 4 ? 'RE' : '';
  }

  private loadFormH(idInforme: number) {
    this.formService.getformHPuenteByIdInforme(idInforme).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.formHData = data[0];
      },
      error: (error) => {
        console.error('Error fetching form H data:', error);
      }
    });
  }

  private loadFormH1(idInforme: number) {
    this.formService.getformH1PuenteByIdInforme(idInforme).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.formH1Data = data[0];
      },
      error: (error) => {
        console.error('Error fetching form H1 data:', error);
      }
    });
  }

  private loadFormH2(idInforme: number) {
    this.formService.getformH2PuenteByIdInforme(idInforme).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.formH2Data = data[0];
      },
      error: (error) => {
        console.error('Error fetching form H2 data:', error);
      }
    });
  }

  get inspectorControl() {
    return this.informeForm.get('inspector');
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
