import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { TelescopicaService } from './services/telescopica.service';
import { PdfService } from '../../services/pdf.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-form-telescopica',
  templateUrl: './form-telescopica.component.html',
  styleUrl: './form-telescopica.component.scss'
})
export class FormTelescopicaComponent implements OnInit, OnDestroy {
  informes: any[] = [];
  itemsWithStatus: any[] = [];
  itemsWithDetail: any[] = [];
  tituloForm: any[] = [];
  descripcionItems: any[] = [];
  originalStatus: any;
  originalValues: any;
  selecInforme: any;
  selecDetalle: any;
  selecStatus: any;
  selecNumInforme: any;
  formHData: any;
  formH1Data: any;
  formH2Data: any;
  photos: any;
  selectedInforme: any | null = null;
  fechaEmisionInforme: string | null = null;
  currentItemIndex: number | null = null;
  isEditing = false;
  showMessage = false;
  isPreviewMode = false;
  showHeaderFooter = false;
  isLoading = false;
  isLoadingPdf = false;
  isSaving = false;
  allowImages = false;
  showModal = false;
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
  isAnyEditing = false;
  messageText = '';
  savingMessage = '';
  messageType: 'success' | 'error' = 'success';
  optionStatus = [
    { idStatus: 1, alias: 'CU' },
    { idStatus: 2, alias: 'N/C' },
    { idStatus: 3, alias: 'N/A' },
    { idStatus: 4, alias: 'RE' },
  ];
  informeForm: FormGroup;
  formH: FormGroup;
  formH1: FormGroup;
  formH2: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private telescopicaService: TelescopicaService,
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

  private createFormGroup(): FormGroup {
    return this.formBuilder.group({
      numeroInforme: [''],
      nombreEmpresa: [''],
      nombrePersona: [''],
      equipo: [''],
      modeloGrua: [''],
      tipoGrua: [''],
      marcaGrua: [''],
      horometroactual: [''],
      capLevanteMaxGrua: [''],
      capLevanteMaxGanchoPrin: [''],
      capLevanteMaxGanchoAux: [''],
      fechaFabricacion: [''],
      numeroSerie: [''],
      patenteVehiculo: [''],
      lugarInspeccion: [''],
      fechaInspeccion: [''],
      estado: [''],
      idResul: [''],
    });
  }

  private createFormH(): FormGroup {
    return this.formBuilder.group({
      fechaPC: [''],
      vigenciaPC: [''],
      lugarPC: [''],
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
      caudalimetro: [''],
      caudalimetroNCertificado: [''],
      otro: [''],
      otroNCertificado: [''],
      descripcionOtro: [''],
      contrapasesGrua: [''],
      nombreOperador: [''],
      radio: [''],
      radioAuxiliar: [''],
      extensionPluma: [''],
      extensionPlumaAuxiliar: [''],
      anguloPluma: [''],
      anguloPlumaAuxiliar: [''],
      cuadrante: [''],
      cuadranteAuxiliar: [''],
      capacidadSegunTabla: [''],
      capacidadSegunTablaAuxiliar: [''],
      cargaPruebaGancho: [''],
      cargaPruebaGanchoAuxiliar: [''],
      porcentajeCapacidadNominal: [''],
      porcentajeCapacidadNominalAuxiliar: [''],
      nombreInspector: [''],
      rutInspector: [''],
      comentarios: ['', [Validators.maxLength(500)]],
    });
  }

  private createFormH1(): FormGroup {
    return this.formBuilder.group({
      ganchoAntes: [''],
      ganchoDespues: [''],
      ganchoHInicio: ['', [Validators.min(0), Validators.max(24)]],
      ganchoHTermino: ['', [Validators.min(0), Validators.max(24)]],
      ganchoResultado: ['SATISFACTORIO', Validators.required],
      ganchoAuxAntes: [''],
      ganchoAuxDespues: [''],
      ganchoAuxHInicio: ['', [Validators.min(0), Validators.max(24)]],
      ganchoAuxHTermino: ['', [Validators.min(0), Validators.max(24)]],
      ganchoAuxResultado: ['SATISFACTORIO', Validators.required],
      comentarios: ['', [Validators.maxLength(500)]],
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
      comentariosMG: ['', [Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    this.informeForm.disable();
    this.getNumeroInformes();
    this.getTitulosForm();
    this.currentDate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  currentDate() {
    const currentDate = new Date();
    this.fechaEmisionInforme = this.datePipe.transform(
      currentDate,
      'dd-MM-yyyy'
    );
  }

  async getNumeroInformes() {
    await this.telescopicaService
      .getRegistroFormTelescopica()
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
    // Reiniciar mensajes de error o éxito
      this.messageText = '';
      this.messageType = 'success';  // O el estado por defecto que prefieras
      this.showMessage = false;
    console.log('Seleccionando informe:', informe);
    this.telescopicaService
      .getInformeTelescopicaByID(informe.idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log('Datos del informe obtenidos:', data);
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

  selectStatus(item: any, selectedIdStatus: string, index: number): void {
  const selectedOption = this.optionStatus.find(
    (option) => option.idStatus.toString() === selectedIdStatus
  );

  if (selectedOption) {
    // Guarda el estado original
    this.originalStatus = { ...item };

    if (selectedIdStatus === '2') {
      item.idStatus = 2;
      item.alias = 'N/C';
      this.openModal(item, true); // Permitir fotos y descripción
    } else if (selectedIdStatus === '4') {
      item.idStatus = 4;
      item.alias = 'RE';
      this.openModal(item, false); // Solo descripción
    } else if (selectedIdStatus === '1') {
      item.idStatus = 1;
      item.alias = 'CU';
      item.descripcionNoCumple = ''; // Limpiar la descripción y fotos
    } else if (selectedIdStatus === '3') {
      item.idStatus = 3;
      item.alias = 'N/A';
      item.descripcionNoCumple = ''; // Limpiar la descripción
    }

    this.cdr.detectChanges(); // Forzar la actualización de la vista
  }
}

  private getTitulosForm() {
    this.telescopicaService
      .getNombreFormTelescopica()
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
    this.telescopicaService
      .getItemTelescopicaByIdInforme(idInforme)
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
    this.telescopicaService
      .getStatusTelescopica()
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
    this.telescopicaService
      .getDetalleTelescopica()
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
    this.telescopicaService
      .getdescripcionTelescopicaByIdInforme(idInforme)
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

  private loadFormH(idInforme: number) {
    this.telescopicaService
      .getformHTelescopicaByIdInforme(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.formHData = data[0];
          // Combina los datos del formHData con selectedInforme
          this.formH.patchValue({
            ...this.formHData,
          });
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching form H data:', error);
        },
      });
  }

  private loadFormH1(idInforme: number) {
    this.telescopicaService
      .getformH1TelescopicaByIdInforme(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.formH1Data = data[0];

          this.formH1.patchValue({
            ganchoAntes: this.formH1Data.ganchoAntes,
            ganchoDespues: this.formH1Data.ganchoDespues,
            ganchoHInicio: this.formH1Data.ganchoHInicio,
            ganchoHTermino: this.formH1Data.ganchoHTermino,
            ganchoResultado: this.formH1Data.ganchoResultado,
            ganchoAuxAntes: this.formH1Data.ganchoAuxAntes,
            ganchoAuxDespues: this.formH1Data.ganchoAuxDespues,
            ganchoAuxHInicio: this.formH1Data.ganchoAuxHInicio,
            ganchoAuxHTermino: this.formH1Data.ganchoAuxHTermino,
            ganchoAuxResultado: this.formH1Data.ganchoAuxResultado,
            comentarios: this.formH1Data.comentarios,
          });
        },
        error: (error) => {
          console.error('Error fetching form H1 data:', error);
        },
      });
  }

  private loadFormH2(idInforme: number) {
    this.telescopicaService
      .getformH2TelescopicaByIdInforme(idInforme)
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
            comentariosMG: this.formH2Data.comentariosMG,
          });
        },
        error: (error) => {
          console.error('Error fetching form H2 data:', error);
        },
      });
  }

  private loadSetFotografico(idInforme: number) {
    this.telescopicaService
      .getSetFotograficoByIdInformeTelescopica(idInforme)
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

  updateFormG(descripcion: any, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    descripcion.descripcion = inputElement.value;
  }

  getStatusLabel(idStatus: number): string {
    return idStatus === 2 ? 'N/C' : idStatus === 4 ? 'RE' : '';
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

    if (this.isEditingStatusB) {
      this.originalValues = this.itemsWithStatus.map(item => ({ ...item }));
    } else {
      // Restaura los valores originales si se cancela la edición
      this.itemsWithStatus = this.originalValues.map((item: any) => ({ ...item }));
    }
  }

  toggleEditStatusC() {
    this.isEditingStatusC = !this.isEditingStatusC;

    if (this.isEditingStatusC) {
      this.originalValues = this.itemsWithStatus.map(item => ({ ...item }));
    } else {
      // Restaura los valores originales si se cancela la edición
      this.itemsWithStatus = this.originalValues.map((item: any) => ({ ...item }));
    }
  }

  toggleEditStatusD() {
    this.isEditingStatusD = !this.isEditingStatusD;

    if (this.isEditingStatusD) {
      this.originalValues = this.itemsWithStatus.map(item => ({ ...item }));
    } else {
      // Restaura los valores originales si se cancela la edición
      this.itemsWithStatus = this.originalValues.map((item: any) => ({ ...item }));
    }
  }

  toggleEditStatusE() {
    this.isEditingStatusE = !this.isEditingStatusE;

    if (this.isEditingStatusE) {
      this.originalValues = this.itemsWithStatus.map(item => ({ ...item }));
    } else {
      // Restaura los valores originales si se cancela la edición
      this.itemsWithStatus = this.originalValues.map((item: any) => ({ ...item }));
    }
  }

  toggleEditStatusF() {
    this.isEditingStatusF = !this.isEditingStatusF;

    if (this.isEditingStatusF) {
      this.originalValues = this.itemsWithStatus.map(item => ({ ...item }));
    } else {
      // Restaura los valores originales si se cancela la edición
      this.itemsWithStatus = this.originalValues.map((item: any) => ({ ...item }));
    }
  }

  saveChanges() {
  console.log('Intentando guardar los cambios...');
  if (this.informeForm.valid && this.selectedInforme) {
    console.log('Formulario válido, guardando cambios...');
    const updatedFields: { [key: string]: any } = {};
    
    // Iteramos sobre los controles del formulario y tomamos solo los campos que han sido modificados
    Object.keys(this.informeForm.controls).forEach(key => {
      if (this.informeForm.get(key)?.dirty) {
        updatedFields[key] = this.informeForm.get(key)?.value;
      }
    });

    const informeData = {
      ...updatedFields,  // Solo los campos modificados
      idInforme: this.selectedInforme.idInforme,
      idUser: this.selectedInforme.idUser,
    };

    this.telescopicaService.editInformeTelescopicas(informeData).subscribe({
      next: (response) => {
        console.log('Datos actualizados exitosamente:', response);
        this.isEditing = false;
        this.showMessage = true;
        this.messageText = 'Datos actualizados exitosamente.';
        this.messageType = 'success';
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
    console.log('Formulario no válido.');
    alert('Por favor, revisa los datos antes de guardar.');
  }
}

  saveChangesStatusA() {
  if (this.selectedInforme) {
    this.isSaving = true;
    this.savingMessage = 'Guardando cambios, por favor espere...';

    const idInforme = this.selectedInforme.idInforme;

    // Filtrar solo los ítems que han sido modificados
    const itemsToUpdate = this.itemsWithStatus.slice(0, 9).filter((item, index) => {
      const originalItem = this.originalValues[index];
      return originalItem && item.idStatus !== originalItem.idStatus;
    });

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems modificados para actualizar en la tabla A.');
      this.isSaving = false;
      return;
    }

    const itemsData = itemsToUpdate.map(item => ({
      idStatus: item.idStatus,
      idInforme: idInforme,
      idDetalle: item.idDetalle
    }));

    console.log('Items data:', itemsData);

    this.telescopicaService.editItemTelescopica(itemsData).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          itemsToUpdate.forEach(item => {
            if (item.idStatus === 2 || item.idStatus === 4) {
              this.addItemToG(item); // Agregar al punto G
            }
          });
          this.refreshStatus();
        } else {
          this.messageText = 'Error al guardar algunos datos.';
          this.messageType = 'error';
        }
      },
      error: (error) => {
        this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
        this.messageType = 'error';
        this.restoreOriginalValues();
        console.error('Error actualizando los datos:', error);
      },
      complete: () => {
        this.isSaving = false;
        this.isEditingStatusA = false;
        setTimeout(() => this.showMessage = false, 3000);
      }
    });
  }
}

  saveChangesStatusB() {
    if (this.selectedInforme) {
        this.isSaving = true; // Activar el spinner
        this.savingMessage = 'Guardando cambios, por favor espere...';

        const idInforme = this.selectedInforme.idInforme;

        // Ajustar los índices según los ítems que quieres actualizar (del 10 al 24, índices 9 al 23)
        const itemsToUpdate = this.itemsWithStatus.slice(9, 24).filter((item, index) => {
            const globalIndex = 9 + index; // Ajustar el índice global
            const originalItem = this.originalValues[globalIndex];
            return originalItem && item.idStatus !== originalItem.idStatus;
        });

        if (itemsToUpdate.length === 0) {
            console.log('No se encontraron ítems modificados para actualizar en la tabla B.');
            this.isSaving = false;
            return;
        }

        const itemsData = itemsToUpdate.map((item) => {
            const itemData = {
                idStatus: item.idStatus,
                idInforme: idInforme,
                idDetalle: item.idDetalle,
            };

            // Si el estado es NO CUMPLE o REVISIÓN ESPECIAL, agregar descripción
            if (item.idStatus === 2 || item.idStatus === 4) {
                const descripcionData = {
                    descripcion: item.descripcionNoCumple || 'Descripción pendiente',
                    idInforme: idInforme,
                    idStatus: item.idStatus,
                    idDetalle: item.idDetalle,
                };

                // Llamar al método para agregar la descripción
                //this.addNotMetDescription(descripcionData);
            }

            return itemData;
        });

        // Llamar al servicio para actualizar los ítems
        this.telescopicaService.editItemTelescopica(itemsData).subscribe({
            next: (response) => {
                if (response.success) {
                    this.showMessage = true;
                    this.messageText = 'Datos actualizados exitosamente.';
                    this.messageType = 'success';
                    this.isAnyEditing = false;
                    // Refrescar los datos para ver los cambios
                    this.refreshStatus();
                } else {
                    this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
                    this.messageType = 'error';
                    this.refreshStatus();
                    this.restoreOriginalValues();
                }
            },
            error: (error) => {
                this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
                this.messageType = 'error';
                console.error('Error actualizando los datos:', error);
                this.refreshStatus();
                this.restoreOriginalValues();
            },
            complete: () => {
                this.showMessage = true;
                setTimeout(() => (this.showMessage = false), 3000);
                this.isSaving = false; // Desactivar el spinner
                this.isEditingStatusB = false;
                this.isAnyEditing = false;
            },
        });
    }
}

  saveChangesStatusC() {
    if (this.selectedInforme) {
        this.isSaving = true; // Activar el spinner
        this.savingMessage = 'Guardando cambios, por favor espere...';

        const idInforme = this.selectedInforme.idInforme;

        // Ajustar los índices para los ítems del 25 al 34, que corresponde a slice(24, 34)
        const itemsToUpdate = this.itemsWithStatus.slice(24, 34).filter((item, index) => {
            const globalIndex = 24 + index; // Ajustar el índice global para comparación
            const originalItem = this.originalValues[globalIndex];
            return originalItem && item.idStatus !== originalItem.idStatus;
        });

        if (itemsToUpdate.length === 0) {
            console.log('No se encontraron ítems modificados para actualizar en la tabla C.');
            this.isSaving = false;
            return;
        }

        const itemsData = itemsToUpdate.map((item) => {
            const itemData = {
                idStatus: item.idStatus,
                idInforme: idInforme,
                idDetalle: item.idDetalle,
            };

            // Si el estado es NO CUMPLE o REVISIÓN ESPECIAL, agregar descripción
            if (item.idStatus === 2 || item.idStatus === 4) {
                const descripcionData = {
                    descripcion: item.descripcionNoCumple || 'Descripción pendiente',
                    idInforme: idInforme,
                    idStatus: item.idStatus,
                    idDetalle: item.idDetalle,
                };

                // Llamar al método para agregar la descripción
                //this.addNotMetDescription(descripcionData);
            }

            return itemData;
        });

        // Llamar al servicio para actualizar los ítems
        this.telescopicaService.editItemTelescopica(itemsData).subscribe({
            next: (response) => {
                if (response.success) {
                    this.showMessage = true;
                    this.messageText = 'Datos actualizados exitosamente.';
                    this.messageType = 'success';
                    this.isAnyEditing = false;
                    // Refrescar los datos para ver los cambios
                    this.refreshStatus();
                } else {
                    this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
                    this.messageType = 'error';
                    this.refreshStatus();
                    this.restoreOriginalValues();
                }
            },
            error: (error) => {
                this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
                this.messageType = 'error';
                console.error('Error actualizando los datos:', error);
                this.refreshStatus();
                this.restoreOriginalValues();
            },
            complete: () => {
                this.showMessage = true;
                setTimeout(() => (this.showMessage = false), 3000);
                this.isSaving = false; // Desactivar el spinner
                this.isEditingStatusC = false;
                this.isAnyEditing = false;
            },
        });
    }
}

  saveChangesStatusD() {
    if (this.selectedInforme) {
        this.isSaving = true; // Activar el spinner
        this.savingMessage = 'Guardando cambios, por favor espere...';

        const idInforme = this.selectedInforme.idInforme;

        // Ajustar los índices para los ítems del 35 al 47, que corresponde a slice(34, 47)
        const itemsToUpdate = this.itemsWithStatus.slice(34, 47).filter((item, index) => {
            const globalIndex = 34 + index; // Ajustar el índice global para comparación
            const originalItem = this.originalValues[globalIndex];
            return originalItem && item.idStatus !== originalItem.idStatus;
        });

        if (itemsToUpdate.length === 0) {
            console.log('No se encontraron ítems modificados para actualizar en la tabla D.');
            this.isSaving = false;
            return;
        }

        const itemsData = itemsToUpdate.map((item) => {
            const itemData = {
                idStatus: item.idStatus,
                idInforme: idInforme,
                idDetalle: item.idDetalle,
            };

            // Si el estado es NO CUMPLE o REVISIÓN ESPECIAL, agregar descripción
            if (item.idStatus === 2 || item.idStatus === 4) {
                const descripcionData = {
                    descripcion: item.descripcionNoCumple || 'Descripción pendiente',
                    idInforme: idInforme,
                    idStatus: item.idStatus,
                    idDetalle: item.idDetalle,
                };

                // Llamar al método para agregar la descripción
                //this.addNotMetDescription(descripcionData);
            }

            return itemData;
        });

        // Llamar al servicio para actualizar los ítems
        this.telescopicaService.editItemTelescopica(itemsData).subscribe({
            next: (response) => {
                if (response.success) {
                    this.showMessage = true;
                    this.messageText = 'Datos actualizados exitosamente.';
                    this.messageType = 'success';
                    this.isAnyEditing = false;
                    // Refrescar los datos para ver los cambios
                    this.refreshStatus();
                } else {
                    this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
                    this.messageType = 'error';
                    this.refreshStatus();
                    this.restoreOriginalValues();
                }
            },
            error: (error) => {
                this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
                this.messageType = 'error';
                console.error('Error actualizando los datos:', error);
                this.refreshStatus();
                this.restoreOriginalValues();
            },
            complete: () => {
                this.showMessage = true;
                setTimeout(() => (this.showMessage = false), 3000);
                this.isSaving = false; // Desactivar el spinner
                this.isEditingStatusD = false;
                this.isAnyEditing = false;
            },
        });
    }
}

  saveChangesStatusE() {
    if (this.selectedInforme) {
        this.isSaving = true; // Activar el spinner
        this.savingMessage = 'Guardando cambios, por favor espere...';

        const idInforme = this.selectedInforme.idInforme;

        // Ajustar los índices para los ítems del 48 al 58, que corresponde a slice(47, 58)
        const itemsToUpdate = this.itemsWithStatus.slice(47, 58).filter((item, index) => {
            const globalIndex = 47 + index; // Ajustar el índice global para comparación
            const originalItem = this.originalValues[globalIndex];
            return originalItem && item.idStatus !== originalItem.idStatus;
        });

        if (itemsToUpdate.length === 0) {
            console.log('No se encontraron ítems modificados para actualizar en la tabla E.');
            this.isSaving = false;
            return;
        }

        const itemsData = itemsToUpdate.map((item) => {
            const itemData = {
                idStatus: item.idStatus,
                idInforme: idInforme,
                idDetalle: item.idDetalle,
            };

            // Si el estado es NO CUMPLE o REVISIÓN ESPECIAL, agregar descripción
            if (item.idStatus === 2 || item.idStatus === 4) {
                const descripcionData = {
                    descripcion: item.descripcionNoCumple || 'Descripción pendiente',
                    idInforme: idInforme,
                    idStatus: item.idStatus,
                    idDetalle: item.idDetalle,
                };

                // Llamar al método para agregar la descripción
                //this.addNotMetDescription(descripcionData);
            }

            return itemData;
        });

        // Llamar al servicio para actualizar los ítems
        this.telescopicaService.editItemTelescopica(itemsData).subscribe({
            next: (response) => {
                if (response.success) {
                    this.showMessage = true;
                    this.messageText = 'Datos actualizados exitosamente.';
                    this.messageType = 'success';
                    this.isAnyEditing = false;
                    // Refrescar los datos para ver los cambios
                    this.refreshStatus();
                } else {
                    this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
                    this.messageType = 'error';
                    this.refreshStatus();
                    this.restoreOriginalValues();
                }
            },
            error: (error) => {
                this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
                this.messageType = 'error';
                console.error('Error actualizando los datos:', error);
                this.refreshStatus();
                this.restoreOriginalValues();
            },
            complete: () => {
                this.showMessage = true;
                setTimeout(() => (this.showMessage = false), 3000);
                this.isSaving = false; // Desactivar el spinner
                this.isEditingStatusE = false;
                this.isAnyEditing = false;
            },
        });
    }
}

  saveChangesStatusF() {
    if (this.selectedInforme) {
        this.isSaving = true; // Activar el spinner
        this.savingMessage = 'Guardando cambios, por favor espere...';

        const idInforme = this.selectedInforme.idInforme;

        // Ajustar los índices para los ítems del 59 al 74, que corresponde a slice(58, 74)
        const itemsToUpdate = this.itemsWithStatus.slice(58, 74).filter((item, index) => {
            const globalIndex = 58 + index; // Ajustar el índice global para comparación
            const originalItem = this.originalValues[globalIndex];
            return originalItem && item.idStatus !== originalItem.idStatus;
        });

        if (itemsToUpdate.length === 0) {
            console.log('No se encontraron ítems modificados para actualizar en la tabla F.');
            this.isSaving = false;
            return;
        }

        const itemsData = itemsToUpdate.map((item) => {
            const itemData = {
                idStatus: item.idStatus,
                idInforme: idInforme,
                idDetalle: item.idDetalle,
            };

            // Si el estado es NO CUMPLE o REVISIÓN ESPECIAL, agregar descripción
            if (item.idStatus === 2 || item.idStatus === 4) {
                const descripcionData = {
                    descripcion: item.descripcionNoCumple || 'Descripción pendiente',
                    idInforme: idInforme,
                    idStatus: item.idStatus,
                    idDetalle: item.idDetalle,
                };

                // Llamar al método para agregar la descripción
                //this.addNotMetDescription(descripcionData);
            }

            return itemData;
        });

        // Llamar al servicio para actualizar los ítems
        this.telescopicaService.editItemTelescopica(itemsData).subscribe({
            next: (response) => {
                if (response.success) {
                    this.showMessage = true;
                    this.messageText = 'Datos actualizados exitosamente.';
                    this.messageType = 'success';
                    this.isAnyEditing = false;
                    // Refrescar los datos para ver los cambios
                    this.refreshStatus();
                } else {
                    this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
                    this.messageType = 'error';
                    this.refreshStatus();
                    this.restoreOriginalValues();
                }
            },
            error: (error) => {
                this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
                this.messageType = 'error';
                console.error('Error actualizando los datos:', error);
                this.refreshStatus();
                this.restoreOriginalValues();
            },
            complete: () => {
                this.showMessage = true;
                setTimeout(() => (this.showMessage = false), 3000);
                this.isSaving = false; // Desactivar el spinner
                this.isEditingStatusF = false;
                this.isAnyEditing = false;
            },
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

} 
