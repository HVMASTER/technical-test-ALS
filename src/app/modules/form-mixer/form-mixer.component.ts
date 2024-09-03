import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MixerService } from './services/mixer.service';
import { PdfService } from './../../services/pdf.service';

@Component({
  selector: 'app-form-mixer',
  templateUrl: './form-mixer.component.html',
  styleUrl: './form-mixer.component.scss'
})
export class FormMixerComponent implements OnInit, OnDestroy {
  formMixerMain: FormGroup;
  informes: any[] = [];
  itemsWithStatus: any[] = [];
  itemsWithDetail: any[] = [];
  betoneraData: any[] = [];
  selectedInforme: any | null = null;
  isEditing = false;
  isEditingStatusA = false;
  isEditingStatusB = false;
  isPreviewMode = false;
  showHeaderFooter = false;
  isLoading = false;
  showMessage = false;
  messageText = '';
  messageType: 'success' | 'error' = 'success';

  optionStatus = [
    { idStatus: 1, alias: 'CU' },
    { idStatus: 2, alias: 'N/C' }
  ];
  private destroy$ = new Subject<void>();

  constructor(
    private mixerService: MixerService,
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe
  ) {
      this.formMixerMain = this.createFormMixerMain();
    }

  ngOnInit(): void {
    this.formMixerMain.disable();
    this.getNumeroInformes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createFormMixerMain(): FormGroup {
    return this.formBuilder.group({
      numeroInforme: [''],
      nombre: [''],
      rut: [''],
      telefono: [''],
      marca: [''],
      modelo: [''],
      color: [''],
      ano: [''],
      numMotor: [''],
      numChasis: [''],
      numInternoCamion: [''],
      combustible: [''],
      odometroActual: [''],
      horometro: [''],
      patenteVehiculo: [''],
      fechaRevisionTec: [''],
      fechaVencSeguroObli: [''],
      fechaVencPermisoCir: [''],
      lugarInspeccion: [''],
      fechaInspeccion: [''],
      estado: [''],
      idResul: [''],
    });
  }

  async getNumeroInformes() {
    await this.mixerService.getRegistroFormMixer()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any[]) => {
          this.informes = data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching informes:', error);
        }
      })
  }

  selectInforme(informe: any) {
    this.mixerService
      .getInformeMixerByID(informe.idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          (this.selectedInforme = data),
            this.formMixerMain.patchValue({
              ...this.selectedInforme,
              idResul: this.selectedInforme.idResul || null,
            });
          this.loadItemDetails(informe.idInforme);
          this.loadBetoneraData(informe.idInforme);
        },
        error: (error) => {
          console.error('Error fetching informe:', error);
        },
      });
  }

  deselectInforme() {
    this.selectedInforme = null;
    this.formMixerMain.reset();
    this.cdr.detectChanges();
  }

  generatePDF() {
    this.isLoading = true;  // Mostrar la barra de carga

    // Ocultar botones antes de generar el PDF
    this.isPreviewMode = true;
    this.showHeaderFooter = true;

    setTimeout(async () => {
    // Generar el PDF
      await this.pdfService.generatePDF('contentToConvert');

      // Restaurar el estado después de la generación del PDF
      this.isLoading = false; // Ocultar la barra de carga
      this.isPreviewMode = false;
      this.showHeaderFooter = false;
    }, 0);
  }

  private loadItemDetails(idInforme: number) {
    this.mixerService
      .getItemMixerByIdInforme(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.loadItemStatus(items);
          this.loadDetail(items);
          setTimeout(() => {
            this.combineItemData();
          }, 500);
        },
        error: (error) => {
          console.error('Error fetching item data:', error);
        },
      });
  }

  private loadItemStatus(items: any[]) {
    this.mixerService
      .getStatusMixer()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (statusList) => {
          this.itemsWithStatus = items.map((item) => {
            const statusObj = statusList.find(
              (status) => status.idStatus === item.idStatus
            );
            return {
              ...item,
              alias: statusObj?.alias || 'N/A',
            };
          });
        },
        error: (error) => {
          console.error('Error fetching status:', error);
        },
      });
  }

  private loadDetail(items: any[]) {
    this.mixerService
      .getDetalleMixer()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detailList) => {
          this.itemsWithDetail = items.map((item) => {
            const detailObj = detailList.find(
              (detail) => detail.idDetalle === item.idDetalle
            );
            return {
              ...item,
              detalle: detailObj?.detalle || 'N/A',
            };
          });
        },
        error: (error) => {
          console.error('Error fetching detail:', error);
        },
      });
  }

  private combineItemData() {
    if (this.itemsWithStatus.length > 0 && this.itemsWithDetail.length > 0) {
      this.itemsWithStatus = this.itemsWithStatus.map((item) => {
        const detailObj = this.itemsWithDetail.find(
          (detail) => detail.idItem === item.idItem
        );
        return {
          ...item,
          detalle: detailObj ? detailObj.detalle : 'N/A',
        };
      });
    }
  }

  selectStatus(item: any, selectedIdStatus: string): void {
    const selectedOption = this.optionStatus.find(option => option.idStatus.toString() === selectedIdStatus);
    if (selectedOption) {
      item.alias = selectedOption.alias;
      item.idStatus = parseInt(selectedIdStatus, 10);
    }
  }

  private loadBetoneraData(idInforme: number): void {
    this.mixerService.getformBetoneraByIdInformeMixer(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.betoneraData = data[0];
          }
        },
        error: (error) => {
          console.error('Error fetching betonera data:', error);
        }
      });
  }

}
