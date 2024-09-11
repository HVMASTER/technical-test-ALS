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
    this.telescopicaService
      .getInformeTelescopicaByID(informe.idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
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
          // this.loadSetFotografico(informe.idInforme);
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

  saveChanges() {
    if (this.informeForm.valid && this.selectedInforme) {
      const informeData = {
        ...this.informeForm.value,
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
