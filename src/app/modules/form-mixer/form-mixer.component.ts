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
  styleUrl: './form-mixer.component.scss',
})
export class FormMixerComponent implements OnInit, OnDestroy {
  formMixerMain: FormGroup;
  informes: any[] = [];
  tituloForm: any[] = [];
  itemsWithStatus: any[] = [];
  itemsWithDetail: any[] = [];
  betoneraData: any;
  torqueDescription: any;
  nonConformities: any[] = [];
  selectedInforme: any | null = null;
  photos: any;
  photoUrl: string = '';
  isEditing = false;
  isEditingStatusA = false;
  isEditingStatusB = false;
  isPreviewMode = false;
  showHeaderFooter = false;
  isLoading = false;
  showMessage = false;
  defaultEmptyRows = new Array(7);
  messageText = '';
  messageType: 'success' | 'error' = 'success';

  optionStatus = [
    { idStatus: 1, alias: 'CU' },
    { idStatus: 2, alias: 'N/C' },
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
    this.getTitulosForm();
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
    await this.mixerService
      .getRegistroFormMixer()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any[]) => {
          this.informes = data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching informes:', error);
        },
      });
  }

  selectInforme(informe: any) {
    this.isLoading = true;
    this.mixerService
      .getInformeMixerByID(informe.idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          (this.selectedInforme = data),
            this.formMixerMain.patchValue({
              ...this.selectedInforme,
            });
          this.loadFormData(informe.idInforme);
        },
        error: (error) => {
          console.error('Error fetching informe:', error);
          this.isLoading = false;
        },
      });
  }

  private loadFormData(idInforme: number) {
    this.loadItemDetails(idInforme);
    this.loadBetoneraData(idInforme);
    this.loadNonConformities(idInforme);
    this.loadSetFotografico(idInforme);
    this.getformTorqueByIdInforme(idInforme);

    // Al finalizar todas las cargas
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  deselectInforme() {
    this.selectedInforme = null;
    this.formMixerMain.reset();
    this.cdr.detectChanges();
  }

  generatePDF() {
    this.isLoading = true; // Mostrar la barra de carga

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
    const selectedOption = this.optionStatus.find(
      (option) => option.idStatus.toString() === selectedIdStatus
    );
    if (selectedOption) {
      item.alias = selectedOption.alias;
      item.idStatus = parseInt(selectedIdStatus, 10);
    }
  }

  private loadBetoneraData(idInforme: number): void {
    this.mixerService
      .getformBetoneraByIdInformeMixer(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.betoneraData = data[0];
          }
        },
        error: (error) => {
          console.error('Error fetching betonera data:', error);
        },
      });
  }

  private loadNonConformities(idInforme: number): void {
    this.mixerService
      .getdescripcionMixerByIdInforme(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.nonConformities = data.filter(
            (item: any) => item.idStatus === 2
          );
          this.addDefaultRows();
        },
        error: (error) => {
          console.error('Error fetching non-conformities:', error);
        },
      });
  }

  private addDefaultRows(): void {
    const totalRows =
      this.nonConformities.length + this.defaultEmptyRows.length;
    if (this.nonConformities.length < this.defaultEmptyRows.length) {
      this.defaultEmptyRows = new Array(
        this.defaultEmptyRows.length - this.nonConformities.length
      );
    } else {
      this.defaultEmptyRows = [];
    }
  }

  private loadSetFotografico(idInforme: number) {
    this.mixerService
      .getSetFotograficoByIdInformeMixer(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.photos.length > 0) {
            this.photos = response.photos;
          }
        },
        error: (error) => {
          console.error('Error fetching set fotografico:', error);
        },
      });
  }

  private getformTorqueByIdInforme(idInforme: number) {
    this.mixerService
      .getformTorqueByIdInforme(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.length > 0) {
            this.torqueDescription = response[0];
          }  
        },
        error: (error) => {
          console.error('Error fetching torque description:', error);
        },
      });
  }

  private getTitulosForm() {
    this.mixerService
      .getNombreFormMixer()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (titulos) => {
          this.tituloForm = titulos;
        },
        error: (error) => {
          console.error('Error fetching form titles:', error);
        },
      });
  }
}
