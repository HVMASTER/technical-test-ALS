import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormService } from './services/form.service';
import { PdfService } from './../../services/pdf.service';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Informe } from './interfaces/informe.interface';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit, OnDestroy {
  informes: Informe[] = [];
  selectedInforme: Informe | null = null;
  informeForm: FormGroup;
  formH: FormGroup;
  formH1: FormGroup;
  formH2: FormGroup;
  itemsWithStatus: any[] = [];
  itemsWithDetail: any[] = [];
  ganchos: any[] = [];
  descripcionItems: any[] = [];
  currentImages: any[] = [];
  currentItemIndex: number | null = null;
  formHData: any;
  formH1Data: any;
  formH2Data: any;
  photos: any;
  selecInforme: any;
  selecDetalle: any;
  selecStatus: any;
  selecNumInforme: any;
  originalStatus: any;
  photoUrl: string = '';
  tituloForm: any[] = [];
  savingMessage = '';
  isSaving = false; 
  isEditing = false;
  isPreviewMode = false;
  isEditingStatusA = false;
  isEditingStatusB = false;
  isEditingStatusC = false;
  isEditingStatusD = false;
  isEditingStatusE = false;
  isEditingStatusF = false;
  isEditingFormG = false;
  isEditingFormH = false;
  isEditingFormH1 = false;
  isEditingFormH2 = false;
  isEditingFormI = false;
  showHeaderFooter = false;
  showModal = false;
  isLoading = false;
  isLoadingPdf = false;
  showMessage = false;
  isAnyEditing = false;
  allowImages = false;
  messageText = '';
  messageType: 'success' | 'error' = 'success';
  originalValues: any;
  optionStatus = [
    { idStatus: 1, alias: 'CU' },
    { idStatus: 2, alias: 'N/C' },
    { idStatus: 3, alias: 'N/A' },
    { idStatus: 4, alias: 'RE' },
  ];
  selectedOption: string | null = null;
  range99: number[] = Array.from({ length: 99 }, (_, i) => i + 1);
  private destroy$ = new Subject<void>();

  constructor(
    private formService: FormService,
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.informeForm = this.createFormGroup();
    this.formH = this.createFormH();
    this.formH1 = this.createFormH1();
    this.formH2 = this.createFormH2();
  }

  ngOnInit(): void {
    this.informeForm.disable();
    this.getNumeroInformes();
    this.getTitulosForm();
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
      idResul: [''],
    });
  }

  private createFormH(): FormGroup {
    return this.formBuilder.group({
      fecha: [''],
      vigencia: [''],
      lugar: [''],
      cintaMetrica: [''],
      cintaMetricaNCertificado: [''],
      pie_metro: [''],
      pie_metroNCertificado: [''],
      bolsasAgua: [''],
      bolsasAguaNCertificado: [''],
      masas: [''],
      masasNCertificado: [''],
      dinamometro: [''],
      dinamometroNCertificado: [''],
      flujometro: [''],
      flujometroNCertificado: [''],
      otro: [''],
      otroNCertificado: [''],
      descripcionOtro: [''],
      poliUnoTraslacion: [''],
      poliUnoDireccion: [''],
      poliUnoIzaje: [''],
      poliDosTraslacion: [''],
      poliDosDireccion: [''],
      poliDosIzaje: [''],
      poliTresTraslacion: [''],
      poliTresDireccion: [''],
      poliTresIzaje: [''],
      cargaPruebaPoli1: [''],
      cargaPruebaPoli2: [''],
      cargaPruebaPoli3: [''],
      cargaSeguraPoli1: [''],
      cargaSeguraPoli2: [''],
      cargaSeguraPoli3: [''],
      operador: ['', Validators.required],
      resulPruebaCarga: ['', Validators.required],
      comentarios: ['', [Validators.maxLength(500)]],
      Nombre: [''],
      rut: [''],
    });
  }

  private createFormH1(): FormGroup {
    return this.formBuilder.group({
      poliUnoAntes: [''],
      poliUnoDespues: [''],
      poliUnoHInicio: ['', [Validators.min(0), Validators.max(24)]],
      poliUnoHTermino: ['', [Validators.min(0), Validators.max(24)]],
      poliUnoResultado: ['SATISFACTORIO', Validators.required],
      poliDosAntes: [''],
      poliDosDespues: [''],
      poliDosHInicio: ['', [Validators.min(0), Validators.max(24)]],
      poliDosHTermino: ['', [Validators.min(0), Validators.max(24)]],
      poliDosResultado: ['SATISFACTORIO', Validators.required],
      poliTresAntes: [''],
      poliTresDespues: [''],
      poliTresHInicio: ['', [Validators.min(0), Validators.max(24)]],
      poliTresHTermino: ['', [Validators.min(0), Validators.max(24)]],
      poliTresResultado: ['SATISFACTORIO', Validators.required],
      condicionFrenos: ['', Validators.required],
    });
  }

  private createFormH2(): FormGroup {
    return this.formBuilder.group({
      longitudUABAntes: [''],
      longitudUABDesp: [''],
      longitudDBCAntes: [''],
      longitudDBCDesp: [''],
      longitudTABAntes: [''],
      longitudTABDesp: [''],
      longitudCBCAntes: [''],
      longitudCBCDesp: [''],
      longitudResulDoble: [''],
      longDABAntes: [''],
      longDABDesp: [''],
      longDBCAntes: [''],
      longDBCDesp: [''],
      longResulSimple: [''],
      longGSABAntes: [''],
      longGSABDesp: [''],
      longGSBCAntes: [''],
      longGSBCDesp: [''],
      longResulSimpleDos: [''],
      longGSATBAntes: [''],
      longGSATBDesp: [''],
      longGSBTCAntes: [''],
      longGSBTCDesp: [''],
      longResulSimpleTres: [''],
    });
  }

  async getNumeroInformes() {
    await this.formService
      .getRegistroFormPuente()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Informe[]) => {
          this.informes = data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching informes:', error);
        },
      });
  }

  selectInforme(informe: Informe) {
    this.formService
      .getInformePuenteByID(informe.idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Informe) => {
          (this.selectedInforme = data),
            this.informeForm.patchValue({
              ...this.selectedInforme,
              fechaInspeccion: this.selectedInforme.fechaInspeccion || '',
              idResul: this.selectedInforme?.idResul || null,
            });

          this.loadItemDetails(informe.idInforme);
          this.loadFormH(informe.idInforme);
          this.loadFormH1(informe.idInforme);
          this.loadFormH2(informe.idInforme);
          this.loadSetFotografico(informe.idInforme);
        },
        error: (error) => {
          console.error('Error fetching informe details:', error);
        },
      });
  }

  private getTitulosForm() {
    this.formService
      .getNombreForm()
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

  private loadItemDetails(idInforme: number) {
    this.formService
      .getItemPuenteByIdInforme(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
        },
      });
  }

  private loadItemStatus(items: any[]) {
    this.formService
      .getStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (statusList) => {
          this.itemsWithStatus = items.map((item) => {
            const statusObj = statusList.find(
              (status) => status.idStatus === item.idStatus
            );
            return {
              ...item,
              status: statusObj?.status || 'N/A',
              alias: statusObj?.alias || 'N/A',
            };
          });
        },
        error: (error) => {
          console.error('Error fetching status:', error);
        },
      });
  }

  loadDetail(items: any[]) {
    this.formService
      .getDetalle()
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

  private loadDescripcion(idInforme: number) {
    this.formService
      .getdescripcionPuenteByIdInforme(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (descripcionItems) => {
          // Filtrar ítems que tienen idStatus = 2 o idStatus = 4
          this.descripcionItems = descripcionItems
            .filter(item => item.idStatus === 2 || item.idStatus === 4)
            .sort((a, b) => a.idDetalle - b.idDetalle);
        },
        error: (error) => {
          console.error('Error fetching descripcion data:', error);
        },
      });
  }

  getStatusLabel(idStatus: number): string {
    return idStatus === 2 ? 'N/C' : idStatus === 4 ? 'RE' : '';
  }

  private loadFormH(idInforme: number) {
    this.formService
      .getformHPuenteByIdInforme(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.formHData = data[0];
          // Combina los datos del formHData con selectedInforme
          this.formH.patchValue({
            ...this.formHData,
            Nombre: this.selectedInforme?.Nombre || this.formHData.Nombre || '',
            rut: this.selectedInforme?.rut || this.formHData.rut || '',
          });
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching form H data:', error);
        },
      });
  }

  private loadFormH1(idInforme: number) {
    this.formService
      .getformH1PuenteByIdInforme(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.formH1Data = data[0];

          this.formH1.patchValue({
            poliUnoAntes: this.formH1Data.poliUnoAntes,
            poliUnoDespues: this.formH1Data.poliUnoDespues,
            poliUnoHInicio: this.formH1Data.poliUnoHInicio,
            poliUnoHTermino: this.formH1Data.poliUnoHTermino,
            poliUnoResultado: this.formH1Data.poliUnoResultado,
            poliDosAntes: this.formH1Data.poliDosAntes,
            poliDosDespues: this.formH1Data.poliDosDespues,
            poliDosHInicio: this.formH1Data.poliDosHInicio,
            poliDosHTermino: this.formH1Data.poliDosHTermino,
            poliDosResultado: this.formH1Data.poliDosResultado,
            poliTresAntes: this.formH1Data.poliTresAntes,
            poliTresDespues: this.formH1Data.poliTresDespues,
            poliTresHInicio: this.formH1Data.poliTresHInicio,
            poliTresHTermino: this.formH1Data.poliTresHTermino,
            poliTresResultado: this.formH1Data.poliTresResultado,
            condicionFrenos: this.formH1Data.condicionFrenos,
          });
        },
        error: (error) => {
          console.error('Error fetching form H1 data:', error);
        },
      });
  }

  private loadFormH2(idInforme: number) {
    this.formService
      .getformH2PuenteByIdInforme(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.formH2Data = data[0];

          this.formH2.patchValue({
            longitudUABAntes: this.formH2Data.longitudUABAntes,
            longitudUABDesp: this.formH2Data.longitudUABDesp,
            longitudDBCAntes: this.formH2Data.longitudDBCAntes,
            longitudDBCDesp: this.formH2Data.longitudDBCDesp,
            longitudTABAntes: this.formH2Data.longitudTABAntes,
            longitudTABDesp: this.formH2Data.longitudTABDesp,
            longitudCBCAntes: this.formH2Data.longitudCBCAntes,
            longitudCBCDesp: this.formH2Data.longitudCBCDesp,
            longitudResulDoble: this.formH2Data.longitudResulDoble,
            longDABAntes: this.formH2Data.longDABAntes,
            longDABDesp: this.formH2Data.longDABDesp,
            longDBCAntes: this.formH2Data.longDBCAntes,
            longDBCDesp: this.formH2Data.longDBCDesp,
            longResulSimple: this.formH2Data.longResulSimple,
            longGSABAntes: this.formH2Data.longGSABAntes,
            longGSABDesp: this.formH2Data.longGSABDesp,
            longGSBCAntes: this.formH2Data.longGSBCAntes,
            longGSBCDesp: this.formH2Data.longGSBCDesp,
            longResulSimpleDos: this.formH2Data.longResulSimpleDos,
            longGSATBAntes: this.formH2Data.longGSATBAntes,
            longGSATBDesp: this.formH2Data.longGSATBDesp,
            longGSBTCAntes: this.formH2Data.longGSBTCAntes,
            longGSBTCDesp: this.formH2Data.longGSBTCDesp,
            longResulSimpleTres: this.formH2Data.longResulSimpleTres,
          });
        },
        error: (error) => {
          console.error('Error fetching form H2 data:', error);
        },
      });
  }

  private loadSetFotografico(idInforme: number) {
    this.formService
      .getSetFotograficoByIdInforme(idInforme)
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

  get operadorControl() {
    return this.formH.get('operador');
  }

  deselectInforme() {
    this.selectedInforme = null;
    this.informeForm.reset();
    this.cdr.detectChanges();
  }

  formatDate(date: string | null): string {
    return date ? this.datePipe.transform(date, 'dd-MM-yyyy')! : '';
  }

  // Función para restaurar los valores originales
  restoreOriginalValues() {
    this.itemsWithStatus = this.originalValues.map((item: any) => ({
      ...item,
    }));
  }

refreshStatus() {
  if (this.selectedInforme) {
    this.loadItemDetails(this.selectedInforme.idInforme);
  }
}

  toggleEdit() {
    if (!this.isEditing) {
        // Guardar los valores actuales antes de comenzar la edición
        this.originalValues = this.informeForm.getRawValue();
        this.informeForm.enable(); // Habilitar el formulario en modo edición
    } else {
        // Si se cancela la edición, restaurar los valores originales
        this.informeForm.patchValue(this.originalValues);
        this.informeForm.disable(); // Deshabilitar el formulario fuera del modo edición
    }
    this.isEditing = !this.isEditing;
  }

  toggleEditStatusA() {
    this.isEditingStatusA = !this.isEditingStatusA;

    if (this.isEditingStatusA) {
        // Guarda los valores actuales para que puedan ser restaurados si se cancela la edición
        this.originalValues = this.itemsWithStatus.map(item => ({ ...item }));
    } else {
        // Restaura los valores originales si se cancela la edición
        this.itemsWithStatus = this.originalValues.map((item: any) => ({ ...item }));
    }
}

  toggleEditStatusB() {
    this.isEditingStatusB = !this.isEditingStatusB;

    if (!this.isEditingStatusB) {
      
    } else {
      // Guarda los valores actuales para que puedan ser restaurados si se cancela la edición
      this.originalValues = this.itemsWithStatus.map(item => ({ ...item }));
    }
  }

  toggleEditStatusC() {
    this.isEditingStatusC = !this.isEditingStatusC;

    if (!this.isEditingStatusC) {
      
    } else {
      // Guarda los valores actuales para que puedan ser restaurados si se cancela la edición
      this.originalValues = this.itemsWithStatus.map(item => ({ ...item }));
    }
  }

  toggleEditStatusD() {
    this.isEditingStatusD = !this.isEditingStatusD;

    if (!this.isEditingStatusD) {
      
    } else {
      // Guarda los valores actuales para que puedan ser restaurados si se cancela la edición
      this.originalValues = this.itemsWithStatus.map(item => ({ ...item }));
    }
  }

  toggleEditStatusE() {
    this.isEditingStatusE = !this.isEditingStatusE;

    if (!this.isEditingStatusE) {
      
    } else {
      // Guarda los valores actuales para que puedan ser restaurados si se cancela la edición
      this.originalValues = this.itemsWithStatus.map(item => ({ ...item }));
    }
  }

  toggleEditStatusF() {
    this.isEditingStatusF = !this.isEditingStatusF;

    if (!this.isEditingStatusF) {
      
    } else {
      // Guarda los valores actuales para que puedan ser restaurados si se cancela la edición
      this.originalValues = this.itemsWithStatus.map(item => ({ ...item }));
    }
  }

  toggleEditFormG() {
  if (this.isEditingFormG) {
    // Si se cancela la edición, restaurar los valores originales
    this.descripcionItems = this.originalValues.map((item: any) => ({ ...item }));
  } else {
    // Al comenzar la edición, almacenar los valores originales
    this.originalValues = this.descripcionItems.map(item => ({ ...item }));
  }
  this.isEditingFormG = !this.isEditingFormG;
}

  toggleEditFormH() {
    this.isEditingFormH = !this.isEditingFormH;
    if (this.isEditingFormH) {
      // Cargamos los valores actuales en el formulario al entrar en modo edición
      this.formH.patchValue(this.formHData);
    }
  }

  toggleEditFormH1() {
    this.isEditingFormH1 = !this.isEditingFormH1;

    if (this.isEditingFormH1) {
        // Cargamos los valores actuales en el formulario al entrar en modo edición
        this.formH1.patchValue({
            poliUnoAntes: this.formH1Data.poliUnoAntes,
            poliUnoDespues: this.formH1Data.poliUnoDespues,
            poliUnoHInicio: this.formH1Data.poliUnoHInicio,
            poliUnoHTermino: this.formH1Data.poliUnoHTermino,
            poliUnoResultado: this.formH1Data.poliUnoResultado,
            poliDosAntes: this.formH1Data.poliDosAntes,
            poliDosDespues: this.formH1Data.poliDosDespues,
            poliDosHInicio: this.formH1Data.poliDosHInicio,
            poliDosHTermino: this.formH1Data.poliDosHTermino,
            poliDosResultado: this.formH1Data.poliDosResultado,
        });
    }
}

  toggleEditFormH2() {
    this.isEditingFormH2 = !this.isEditingFormH2;

    if (!this.isEditingFormH2) {
        // Guardar cambios al salir del modo de edición
        this.saveFormH2Changes();
    } else if (this.formH2Data) {
        // Cargar los datos existentes en el formulario al entrar en modo edición
        this.formH2.patchValue({
            longitudUABAntes: this.formH2Data.longitudUABAntes,
            longitudUABDesp: this.formH2Data.longitudUABDesp,
            longitudDBCAntes: this.formH2Data.longitudDBCAntes,
            longitudDBCDesp: this.formH2Data.longitudDBCDesp,
            longitudTABAntes: this.formH2Data.longitudTABAntes,
            longitudTABDesp: this.formH2Data.longitudTABDesp,
            longitudCBCAntes: this.formH2Data.longitudCBCAntes,
            longitudCBCDesp: this.formH2Data.longitudCBCDesp,
            longitudResulDoble: this.formH2Data.longitudResulDoble,
            longDABAntes: this.formH2Data.longDABAntes,
            longDABDesp: this.formH2Data.longDABDesp,
            longDBCAntes: this.formH2Data.longDBCAntes,
            longDBCDesp: this.formH2Data.longDBCDesp,
            longResulSimple: this.formH2Data.longResulSimple,
            longGSABAntes: this.formH2Data.longGSABAntes,
            longGSABDesp: this.formH2Data.longGSABDesp,
            longGSBCAntes: this.formH2Data.longGSBCAntes,
            longGSBCDesp: this.formH2Data.longGSBCDesp,
            longResulSimpleDos: this.formH2Data.longResulSimpleDos,
            longGSATBAntes: this.formH2Data.longGSATBAntes,
            longGSATBDesp: this.formH2Data.longGSATBDesp,
            longGSBTCAntes: this.formH2Data.longGSBTCAntes,
            longGSBTCDesp: this.formH2Data.longGSBTCDesp,
            longResulSimpleTres: this.formH2Data.longResulSimpleTres,
        });
    } else {
        alert('No se pueden cargar los datos para la edición.'); // Opcional, manejo de errores
    }
}

  toggleEditFormI() {
    this.isEditingFormI = !this.isEditingFormI;
    if (this.isEditingFormI) {
      // Habilita el control idResul cuando se entra en modo edición
      this.informeForm.get('idResul')?.enable();

      // Cargamos los valores actuales en el formulario al entrar en modo edición
      this.informeForm.patchValue({
        idResul: this.selectedInforme?.idResul || null,
      });

      console.log('Valor de idResul en el formulario:', this.informeForm.get('idResul')?.value);
    } else {
      // Deshabilita el control idResul cuando se sale del modo edición
      this.informeForm.get('idResul')?.disable();

      this.saveChanges(); // Guardamos los cambios si se sale del modo de edición
    }
  }

  saveChanges() {
    if (this.informeForm.valid && this.selectedInforme) {
      const informeData = {
        ...this.informeForm.value,
        idInforme: this.selectedInforme.idInforme,
        idUser: this.selectedInforme.idUser,
      };

      this.formService.editInformePuente(informeData).subscribe({
        next: (response) => {
          console.log('Datos actualizados exitosamente:', response);
          this.isEditing = false;
          this.isEditingFormI = false;
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          // Ocultar el mensaje después de unos segundos
          setTimeout(() => this.showMessage = false, 3000);
        },
        error: (error) => {
          console.error('Error al actualizar los datos:', error);
          this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        },
      });
    } else {
      alert('Por favor, revisa los datos antes de guardar.');
    }
  }

  saveChangesStatusA() {
    if (this.selectedInforme) {
        this.isSaving = true; // Activar el spinner
        this.savingMessage = 'Guardando cambios, por favor espere...'; 

        const idInforme = this.selectedInforme?.idInforme;

        // Filtrar solo los ítems que han sido modificados
        const itemsToUpdate = this.itemsWithStatus.slice(0, 11).filter((item, index) => {
            const originalItem = this.originalValues[index];
            return originalItem && (item.idStatus !== originalItem.idStatus);
        });

        if (itemsToUpdate.length === 0) {
            console.log('No se encontraron ítems modificados para actualizar en la tabla A.');
            this.isSaving = false;
            return;
        }

        // Crear un array con los datos de los ítems
        const itemsData = itemsToUpdate.map(item => ({
            idStatus: item.idStatus,
            idInforme: idInforme,
            idDetalle: item.idDetalle
        }));

        console.log('Items data:', itemsData);

        this.formService.editItemPuente(itemsData).pipe().subscribe({
            next: (response) => {
                if ((response as any).success) {
                    this.showMessage = true;
                    this.messageText = 'Datos actualizados exitosamente.';
                    this.messageType = 'success';

                    // Si algún ítem tiene el status N/C o RE, agregar al punto G
                    itemsToUpdate.forEach(item => {
                        if (item.idStatus === 2 || item.idStatus === 4) {
                            this.addItemToG(item); // Agregar al punto G
                        }
                    });
                    
                    this.refreshStatus();
                } else {
                    this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
                    this.messageType = 'error';
                    this.refreshStatus();
                }
            },
            error: (error) => {
                this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
                this.messageType = 'error';
                console.error('Error actualizando los datos:', error);
                this.restoreOriginalValues();
            },
            complete: () => {
                this.showMessage = true;
                setTimeout(() => (this.showMessage = false), 3000);
                this.isSaving = false; // Desactivar el spinner
                this.isEditingStatusA = false;
            }
        });
    }
}

  saveChangesStatusB() {
    if (this.selectedInforme) {
      const idInforme = this.selectedInforme?.idInforme;

      const itemsToUpdate = this.itemsWithStatus.slice(11, 19); //items del 12 al 19

      if (itemsToUpdate.length === 0) {
        console.log('No se encontraron ítems para actualizar en la tabla B.');
        return;
      }

      itemsToUpdate.forEach(item => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle
        };

        this.formService.editItemPuente(itemData).subscribe({
          next: (response) => {
            this.showMessage = true;
            this.messageText = 'Datos actualizados exitosamente.';
            this.messageType = 'success';

            setTimeout(() => this.showMessage = false, 3000);
          },
          error: (error) => {
            console.error(`Error al actualizar el item ${item.idItem}:`, error);
            this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
            this.messageType = 'error';
            this.showMessage = true;
          }
        });
      });

      this.isEditingStatusB = false;
    }
  }

  saveChangesStatusC() {
    if (this.selectedInforme) {
      const idInforme = this.selectedInforme.idInforme;

      const itemsToUpdate = this.itemsWithStatus.slice(19, 26); // items del 20 al 26
      if (itemsToUpdate.length === 0) {
        console.log('No se encontraron ítems para actualizar en la tabla C.');
        return;
      }

      itemsToUpdate.forEach(item => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle
        };

        this.formService.editItemPuente(itemData).subscribe({
          next: (response) => {
            this.showMessage = true;
            this.messageText = 'Datos actualizados exitosamente.';
            this.messageType = 'success';

            setTimeout(() => this.showMessage = false, 3000);
          },
          error: (error) => {
            console.error(`Error al actualizar el item ${item.idItem}:`, error);
            this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
            this.messageType = 'error';
            this.showMessage = true;
          }
        });
      });

      this.isEditingStatusC = false;
    }
  }

  saveChangesStatusD() {
    if (this.selectedInforme) {
      const idInforme = this.selectedInforme.idInforme;

      const itemsToUpdate = this.itemsWithStatus.slice(26, 43); //items del 27 al 43

      if (itemsToUpdate.length === 0) {
        console.warn('No se encontraron ítems para actualizar en la tabla D.');
        return;
      }

      itemsToUpdate.forEach(item => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle
        };

        this.formService.editItemPuente(itemData).subscribe({
          next: (response) => {
            this.showMessage = true;
            this.messageText = 'Datos actualizados exitosamente.';
            this.messageType = 'success';

            setTimeout(() => this.showMessage = false, 3000);
          },
          error: (error) => {
            console.error(`Error al actualizar el item ${item.idItem}:`, error);
            this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
            this.messageType = 'error';
            this.showMessage = true;
          }
        });
      });

      this.isEditingStatusD = false;
    }
  }

  saveChangesStatusE() {
    if (this.selectedInforme) {
      const idInforme = this.selectedInforme.idInforme;

      const itemsToUpdate = this.itemsWithStatus.slice(43, 52); // items del 44 a 52

      if (itemsToUpdate.length === 0) {
        console.log('No se encontraron ítems para actualizar en la tabla E.');
        return;
      }

      itemsToUpdate.forEach(item => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle
        };

        this.formService.editItemPuente(itemData).subscribe({
          next: (response) => {
            this.showMessage = true;
            this.messageText = 'Datos actualizados exitosamente.';
            this.messageType = 'success';

            setTimeout(() => this.showMessage = false, 3000);
          },
          error: (error) => {
            console.error(`Error al actualizar el item ${item.idItem}:`, error);
            this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
            this.messageType = 'error';
            this.showMessage = true;
          }
        });
      });

      this.isEditingStatusE = false;
    }
  }

  saveChangesStatusF() {
    if (this.selectedInforme) {
      const idInforme = this.selectedInforme.idInforme;

      const itemsToUpdate = this.itemsWithStatus.slice(52, 68); //items del 53 al 68

      if (itemsToUpdate.length === 0) {
        console.warn('No se encontraron ítems para actualizar en la tabla F.');
        return;
      }

      itemsToUpdate.forEach(item => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle
        };

        this.formService.editItemPuente(itemData).subscribe({
          next: (response) => {
            this.showMessage = true;
            this.messageText = 'Datos actualizados exitosamente.';
            this.messageType = 'success';

            setTimeout(() => this.showMessage = false, 3000);
          },
          error: (error) => {
            console.error(`Error al actualizar el item ${item.idItem}:`, error);
            this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
            this.messageType = 'error';
            this.showMessage = true;
          }
        });
      });

      this.isEditingStatusF = false;
    }
  }

  saveChangesFormG() {
    const itemsToUpdate = this.descripcionItems.filter(
      (item) => item.idStatus === 2 || item.idStatus === 4
    );

    if (itemsToUpdate.length === 0) {
      alert('No hay ítems RE o N/C para actualizar.');
      return;
    }

    itemsToUpdate.forEach((item) => {
      const itemData = {
        descripcion: item.descripcion,
        idInforme: item.idInforme,
        idDetalle: item.idDetalle,
        idStatus: item.idStatus,
      };

      this.formService.editDescripcionPuente(itemData).subscribe({
        next: (response) => {
          console.log(`Descripción para idDetalle ${item.idDetalle} guardada exitosamente.`);
        },
        error: (error) => {
          console.error(`Error al guardar la descripción para idDetalle ${item.idDetalle}:`, error);
          alert('Ocurrió un error al intentar guardar los datos del Formulario G.');
        },
      });
    });

    this.isEditingFormG = false;
  }

  saveFormHChanges() {
    if (this.formH.valid && this.selectedInforme) {
      const formHData = this.formH.value;
      const idInforme = this.selectedInforme.idInforme;

      this.formService.editFormHPuente(idInforme, formHData).subscribe({
        next: (response) => {
          console.log(
            'Datos del Formulario H guardados exitosamente:',
            response
          );
          this.isEditingFormH = false;
        },
        error: (error) => {
          console.error('Error al guardar los datos del Formulario H:', error);
          alert(
            'Ocurrió un error al intentar guardar los datos del Formulario H.'
          );
        },
      });
    } else {
      alert('Por favor, revisa los datos antes de guardar.');
    }
  }

  saveFormH1Changes() {
    if (this.formH1.valid) {
        console.log('Datos del Formulario H1 guardados:', this.formH1.value);
        this.formH1Data = this.formH1.value; // Actualizamos los datos guardados
        this.isEditingFormH1 = false; // Salimos del modo de edición
    } else {
        alert('Por favor, revisa los datos antes de guardar.');
    }
}

  saveFormH2Changes() {
    if (this.formH2.valid) {
      console.log('Datos del Formulario H2 guardados:', this.formH2.value);
    }
  }

  saveFormIChanges() {
    if (this.informeForm.get('idResul')?.valid && this.selectedInforme) {
      const newValue = this.informeForm.get('idResul')?.value;
      this.selectedInforme.idResul = newValue;
      console.log('Nuevo valor de idResul:', this.selectedInforme.idResul);
      this.isEditingFormI = false;
    } else {
      alert('Por favor, revisa los datos antes de guardar.');
    }
  }

  selectStatus(item: any, selectedIdStatus: string, index: number): void {
  const selectedOption = this.optionStatus.find(
    (option) => option.idStatus.toString() === selectedIdStatus
  );

  if (selectedOption) {
    // Guardar el estado original antes de abrir el modal
    this.originalStatus = { ...item };

    if (selectedIdStatus === '2') {
      // Si el estado es "No Cumple" (N/C)
      item.idStatus = 2; // Actualizar el idStatus a "No Cumple"
      item.alias = 'N/C'; // Asignar el alias
      this.openModal(item, true); // Llamar al modal permitiendo fotos y descripción
    } else if (selectedIdStatus === '4') {
      // Si el estado es "Revisión Especial" (RE)
      item.idStatus = 4;
      item.alias = 'RE';
      this.openModal(item, false); // Llamar al modal solo con descripción
    // } else if (selectedIdStatus === '1' && item.idStatus === 2) {
    //   // Si se intenta cambiar de "No Cumple" a "Cumple" (N/C -> CU)
    //   const confirmChange = window.confirm(
    //     '¿Estás seguro de cambiar el estado de N/C a C/U? Esto eliminará las imágenes y la descripción asociadas a este ítem.'
    //   );

    //   if (confirmChange) {
    //     // Borrar descripción y fotos
    //     this.deleteDescriptionAndPhotos(item);

    //     // Actualizar el estado a "Cumple"
    //     item.idStatus = 1;
    //     item.alias = 'CU';
    //     item.descripcionNoCumple = ''; // Limpiar la descripción de "No Cumple"
    //     item.images = []; // Limpiar las imágenes asociadas
    //   } else {
    //     // Si el usuario cancela, restaurar el estado a "No Cumple"
    //     item.idStatus = 2;
    //   }
    // } else if (selectedIdStatus === '1') {
      // Si es "Cumple", actualizar el estado directamente (sin haber sido N/C)
      item.idStatus = 1;
      item.alias = 'CU';
      item.descripcionNoCumple = '';
    }

    this.cdr.detectChanges(); // Forzar la actualización visual
  }
}

  openModal(item: any, allowImages: boolean): void {
  const idInforme = this.selectedInforme?.idInforme;
  const numeroInforme = this.informeForm.get('numeroInforme')?.value;
  const idDetalle = item.idDetalle;
  const idStatus = item.idStatus;

  // Verifica si tienes todos los datos requeridos
  if (!idInforme || !numeroInforme || !idDetalle || !idStatus) {
    console.error('Datos faltantes al intentar abrir el modal.');
    return;
  }

  //guardar el estado original del item
  this.originalStatus = { ...item };

  // Asignar valores a las propiedades del modal
  this.selecInforme = idInforme;
  this.selecNumInforme = numeroInforme;
  this.selecDetalle = idDetalle;
  this.selecStatus = idStatus;

  // Determinar si se permiten imágenes o solo la descripción
  this.allowImages = allowImages;

  // Mostrar el modal
  this.showModal = true;
  this.currentItemIndex = this.itemsWithStatus.indexOf(item);

  // Agregar logs para verificar la correcta asignación
  console.log('Modal abierto con los siguientes datos:');
  console.log('idInforme:', idInforme);
  console.log('numeroInforme:', numeroInforme);
  console.log('idDetalle:', idDetalle);
  console.log('idStatus:', idStatus);
  console.log('allowImages:', allowImages); // Verificación de permisos de imágenes
}

  closeModal(modalData: { description: string; images: string[]; imagesNames: any[] }): void {
  if (this.currentItemIndex !== null) {
    const currentItem = this.itemsWithStatus[this.currentItemIndex];
    currentItem.descripcionNoCumple = modalData.description;

    if (this.allowImages) {
      currentItem.images = modalData.images;
      currentItem.imagesNames = modalData.imagesNames;
    }

    this.showModal = false;
    this.currentItemIndex = null;
    this.cdr.detectChanges(); // Actualizar la vista
  }
}

  cancelModal(): void {
  // Verifica si hay un ítem seleccionado para restaurar su estado original
  if (this.currentItemIndex !== null && this.originalStatus) {
    // Restaurar el ítem al estado original antes de abrir el modal
    this.itemsWithStatus[this.currentItemIndex] = { ...this.originalStatus };
  }

  // Ocultar el modal y limpiar las variables relacionadas
  this.showModal = false;
  this.currentItemIndex = null;
  this.originalStatus = null;
  this.allowImages = false;

  // Actualizar la vista para reflejar los cambios
  this.cdr.detectChanges();
}


  updateFormG(descripcion: any, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    descripcion.descripcion = inputElement.value;
  }

  togglePreview() {
    this.isPreviewMode = !this.isPreviewMode;
    this.showHeaderFooter = this.isPreviewMode;
    const contentContainer = document.getElementById('contentToConvert');
    
    if (this.isPreviewMode) {
      this.informeForm.disable();
      this.hideButtonsForPreview(true);
      contentContainer?.classList.add('preview-mode');
    } else {
      if (!this.isEditing) {
        this.informeForm.disable();
      } else {
        this.informeForm.enable();
      }
      this.hideButtonsForPreview(false);
      contentContainer?.classList.remove('preview-mode');
    }
  }

  // Ocultar o mostrar los botones de edición y guardar según el modo de vista previa
  hideButtonsForPreview(hide: boolean) {
    const buttons = document.querySelectorAll('.edit-save-buttons');
    buttons.forEach((button: Element) => {
      (button as HTMLElement).style.display = hide ? 'none' : 'block';
    });
  }

  addItemToG(item: any) {
    const existingItem = this.descripcionItems.find(descItem => descItem.idDetalle === item.idDetalle);
    
    if (!existingItem) {
        this.descripcionItems.push({
          idDetalle: item.idDetalle,
          idStatus: item.idStatus,
          descripcion: '', // Descripción vacía para que el usuario la complete
          idInforme: this.selectedInforme?.idInforme
        });
    }
  }

  generatePDF() {
  this.isLoadingPdf = true; // Mostrar la barra de carga

  // Ocultar botones antes de generar el PDF
  this.isPreviewMode = true;
  this.showHeaderFooter = true;

  // Definir los ajustes específicos para las páginas
  const pageAdjustments: any[] = [];

  setTimeout(async () => {
    const content = document.getElementById('contentToConvert');
    if (content) {
      const pages = content.querySelectorAll('.page');
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        const canvas = await html2canvas(page); // Crear el canvas
        const canvasHeight = (canvas.height * 210) / canvas.width; // Calcular el alto del canvas ajustado al ancho A4

        // Ajustes específicos por página
        if (i >= 0 && i < 5) {
          // Aumentar el tamaño en las páginas 1-5
          pageAdjustments.push({ scale: 1.2 });
        } else if (i === 5) {
          // Centrar el contenido en la página 6
          pageAdjustments.push({ yOffset: (297 - canvasHeight) / 2 });
        } else {
          // Sin ajustes adicionales para otras páginas
          pageAdjustments.push({});
        }
      }

      // Generar el PDF con los ajustes específicos
      await this.pdfService.generatePDF('contentToConvert', pageAdjustments);
    }

    // Restaurar el estado después de la generación del PDF
    this.isLoadingPdf = false; // Ocultar la barra de carga
    this.isPreviewMode = false;
    this.showHeaderFooter = false;
  }, 0);
}


}
