import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MixerService } from './services/mixer.service';
import { PdfService } from './../../services/pdf.service';
import html2canvas from 'html2canvas';

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
  currentImages: any[] = [];
  selectedInforme: any | null = null;
  fechaEmisionInforme: string | null = null;
  currentItemIndex: number | null = null;
  selecInforme: any;
  selecDetalle: any;
  selecStatus: any;
  selecNumInforme: any;
  photos: any;
  originalValues: any;
  photoUrl: string = '';
  savingMessage = '';
  currentDescription = '';
  originalStatus: any;
  isSaving = false;
  isAnyEditing = false;
  isEditing = false;
  isEditingStatusA = false;
  isEditingStatusB = false;
  isEditingStatusC = false;
  isEditingStatusD = false;
  isEditingStatusE = false;
  isEditingStatusF = false;
  isEditingStatusG = false;
  isEditingStatusH = false;
  isEditingStatusI = false;
  isEditingStatusJ = false;
  isEditingStatusK = false;
  isEditingStatusL = false;
  isEditingStatusM = false;
  isEditingTorque = false;
  isEditingBetonera = false;
  isEditingDescription = false;
  isEditingResult = false;
  isPreviewMode = false;
  showHeaderFooter = false;
  isLoading = false;
  isLoadingPdf = false;
  showMessage = false;
  showModal = false;
  defaultEmptyRows = new Array(7);
  retryCount = 0;
  messageText = '';
  messageType: 'success' | 'error' | 'warning' = 'success';

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
    this.currentDate();
  }

  currentDate() {
    const currentDate = new Date();
    this.fechaEmisionInforme = this.datePipe.transform(
      currentDate,
      'dd-MM-yyyy'
    );
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
          this.selectedInforme = data;

          const fechaInspeccionFormateada = this.formatDate(
            this.selectedInforme.fechaInspeccion
          );
          const proximoControlFormateado = this.getNextControlDate(
            this.selectedInforme.fechaInspeccion
          );

          this.formMixerMain.patchValue({
            ...this.selectedInforme,
            fechaInspeccion: fechaInspeccionFormateada, // Formatear la fecha de inspección
            proximoControl: proximoControlFormateado, // Agregar el próximo control
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

          // Aumentar el tamaño en las páginas 1-5
          if (i >= 0 && i < 5) {
            pageAdjustments.push({ scale: 1.1 });

            // Centrar el contenido en la página 6
          } else if (i === 7) {
            // Sin ajustes adicionales para otras páginas
            pageAdjustments.push({ yOffset: (297 - canvasHeight) / 2 });
          } else {
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

  togglePreview() {
    this.isPreviewMode = !this.isPreviewMode;
    this.showHeaderFooter = this.isPreviewMode;
    const contentContainer = document.getElementById('contentToConvert');

    if (this.isPreviewMode) {
      this.formMixerMain.disable();
      this.hideButtonsForPreview(true);
      contentContainer?.classList.add('preview-mode');
    } else {
      if (!this.isEditing) {
        this.formMixerMain.disable();
      } else {
        this.formMixerMain.enable();
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

  selectStatus(item: any, selectedIdStatus: string, index: number): void {
    const selectedOption = this.optionStatus.find(
      (option) => option.idStatus.toString() === selectedIdStatus
    );

    if (selectedOption) {
      // Guardar el estado original antes de abrir el modal
      this.originalStatus = { ...item };

      if (selectedIdStatus === '2') {
        // Solo abrir el modal si se selecciona "No Cumple" (N/C)
        item.idStatus = 2; // Actualizar el idStatus a "No Cumple"
        item.alias = 'N/C'; // Asignar el alias
        this.openModal(item);
      } else if (selectedIdStatus === '1' && item.idStatus === 2) {
        // Si se intenta cambiar de "No Cumple" a "Cumple" (N/C -> CU)
        const confirmChange = window.confirm(
          '¿Estás seguro de cambiar el estado de N/C a C/U? Esto eliminará las imágenes y la descripción asociadas a este ítem.'
        );

        if (confirmChange) {
          // Borrar descripción y fotos
          this.deleteDescriptionAndPhotos(item);

          // Actualizar el estado a "Cumple"
          item.idStatus = 1;
          item.alias = 'CU';
          item.descripcionNoCumple = ''; // Limpiar la descripción de "No Cumple"
          item.images = []; // Limpiar las imágenes asociadas
        } else {
          // Si el usuario cancela, restaurar el estado a "No Cumple"
          item.idStatus = 2;
        }
      } else if (selectedIdStatus === '1') {
        // Si es "Cumple", actualizar el estado directamente (sin haber sido N/C)
        item.idStatus = 1; // Actualizar a "Cumple"
        item.alias = 'CU'; // Asignar el alias
        item.descripcionNoCumple = ''; // Limpiar la descripción de "No Cumple"
      }

      this.cdr.detectChanges(); // Forzar la actualización visual
    }
  }

  private addNotMetDescription(descriptionData: any): void {
    this.mixerService
      .postDescripcionMixer(descriptionData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Descripción agregada exitosamente.');
          } else {
            console.error('Error al agregar la descripción:', response.message);
          }
        },
        error: (error) => {
          console.error('Error al agregar la descripción:', error);
        },
      });
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

          // Agregar dinámicamente los campos de descripción al FormGroup
          this.nonConformities.forEach((nonConformity, index) => {
            const controlName = `descripcion_${index}`;
            this.formMixerMain.addControl(
              controlName,
              this.formBuilder.control(
                nonConformity.descripcion,
                Validators.required
              )
            );
          });
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
    this.photos = []; // Limpiar las fotos anteriores
    this.mixerService
      .getSetFotograficoByIdInformeMixer(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.photos.length > 0) {
            const validPhotos = response.photos.filter((photo: any) =>
              this.isValidBase64(photo.data)
            );

            if (validPhotos.length > 0) {
              this.photos = validPhotos;
            } else {
              console.log('No valid photos found for this informe');
            }
          } else {
            console.log('No photos found for this informe');
          }
        },
        error: (error) => {
          console.error('Error fetching set fotografico:', error);
        },
      });
  }

  // Método para verificar si una cadena es Base64 válida
  private isValidBase64(data: string): boolean {
    const base64Regex =
      /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
    return !!data && base64Regex.test(data);
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

  // Función para restaurar los valores originales
  restoreOriginalValues() {
    this.itemsWithStatus = this.originalValues.map((item: any) => ({
      ...item,
    }));
  }

  refreshStatus() {
    this.loadItemDetails(this.selectedInforme.idInforme);
  }

  refreshNonConformities() {
    this.loadNonConformities(this.selectedInforme.idInforme);
  }

  handleError(error?: any) {
    console.error('Error actualizando los datos', error);
    this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
    this.messageType = 'error';
    this.showMessage = true;
    setTimeout(() => (this.showMessage = false), 3000);
  }

  toggleEdit() {
    if (!this.isAnyEditing) {
      this.isEditing = true;
      this.isAnyEditing = true;
      this.originalValues = this.formMixerMain.getRawValue();
      this.formMixerMain.enable();
    } else if (this.isEditing) {
      this.formMixerMain.patchValue(this.originalValues);
      this.formMixerMain.disable();
      this.isEditing = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditStatusA() {
    if (!this.isAnyEditing) {
      this.isEditingStatusA = true;
      this.isAnyEditing = true;
      this.originalValues = JSON.parse(JSON.stringify(this.itemsWithStatus)); // Copia profunda
    } else if (this.isEditingStatusA) {
      this.itemsWithStatus = JSON.parse(JSON.stringify(this.originalValues)); // Restaurar
      this.isEditingStatusA = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditStatusB() {
    if (!this.isAnyEditing) {
      this.isEditingStatusB = true;
      this.isAnyEditing = true;
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else if (this.isEditingStatusB) {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
      this.isEditingStatusB = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditStatusC() {
    if (!this.isAnyEditing) {
      this.isEditingStatusC = true;
      this.isAnyEditing = true;
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else if (this.isEditingStatusC) {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
      this.isEditingStatusC = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditStatusD() {
    if (!this.isAnyEditing) {
      this.isEditingStatusD = true;
      this.isAnyEditing = true;
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else if (this.isEditingStatusD) {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
      this.isEditingStatusD = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditStatusE() {
    if (!this.isAnyEditing) {
      this.isEditingStatusE = true;
      this.isAnyEditing = true;
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else if (this.isEditingStatusE) {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
      this.isEditingStatusE = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditStatusF() {
    if (!this.isAnyEditing) {
      this.isEditingStatusF = true;
      this.isAnyEditing = true;
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else if (this.isEditingStatusF) {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
      this.isEditingStatusF = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditStatusG() {
    if (!this.isAnyEditing) {
      this.isEditingStatusG = true;
      this.isAnyEditing = true;
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else if (this.isEditingStatusG) {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
      this.isEditingStatusG = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditStatusH() {
    if (!this.isAnyEditing) {
      this.isEditingStatusH = true;
      this.isAnyEditing = true;
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else if (this.isEditingStatusH) {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
      this.isEditingStatusH = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditStatusI() {
    if (!this.isAnyEditing) {
      this.isEditingStatusI = true;
      this.isAnyEditing = true;
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else if (this.isEditingStatusI) {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
      this.isEditingStatusI = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditStatusJ() {
    if (!this.isAnyEditing) {
      this.isEditingStatusJ = true;
      this.isAnyEditing = true;
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else if (this.isEditingStatusJ) {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
      this.isEditingStatusJ = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditStatusK() {
    if (!this.isAnyEditing) {
      this.isEditingStatusK = true;
      this.isAnyEditing = true;
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else if (this.isEditingStatusK) {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
      this.isEditingStatusK = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditStatusL() {
    if (!this.isAnyEditing) {
      this.isEditingStatusL = true;
      this.isAnyEditing = true;
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else if (this.isEditingStatusL) {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
      this.isEditingStatusL = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditStatusM() {
    if (!this.isAnyEditing) {
      this.isEditingStatusM = true;
      this.isAnyEditing = true;
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else if (this.isEditingStatusM) {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
      this.isEditingStatusM = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditTorque() {
    if (!this.isAnyEditing) {
      this.isEditingTorque = true;
      this.isAnyEditing = true;
      this.originalValues = { ...this.torqueDescription };
    } else if (this.isEditingTorque) {
      this.torqueDescription = { ...this.originalValues };
      this.isEditingTorque = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditBetonera() {
    if (!this.isAnyEditing) {
      this.isEditingBetonera = true;
      this.isAnyEditing = true;
      this.originalValues = { ...this.betoneraData };
    } else if (this.isEditingBetonera) {
      this.betoneraData = { ...this.originalValues };
      this.isEditingBetonera = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditDescription() {
    if (!this.isAnyEditing) {
      this.isEditingDescription = true;
      this.isAnyEditing = true;
    } else if (this.isEditingDescription) {
      this.isEditingDescription = false;
      this.isAnyEditing = false;

      this.nonConformities.forEach((item, index) => {
        this.formMixerMain
          .get(`descripcion_${index}`)
          ?.setValue(item.descripcion);
      });
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditResult() {
    if (!this.isAnyEditing) {
      this.isEditingResult = true;
      this.isAnyEditing = true;

      this.formMixerMain.get('idResul')?.enable();

      this.originalValues = {
        idResul: this.formMixerMain.get('idResul')?.value,
      };
    } else if (this.isEditingResult) {
      this.formMixerMain.get('idResul')?.setValue(this.originalValues.idResul);
      this.formMixerMain.get('idResul')?.disable();
      this.isEditingResult = false;
      this.isAnyEditing = false;
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  saveChanges() {
    if (this.formMixerMain.valid && this.selectedInforme) {
      const InformeData = {
        ...this.formMixerMain.value,
        idInforme: this.selectedInforme.idInforme,
        idUser: this.selectedInforme.idUser,
      };

      this.mixerService.editInformeMixer(InformeData).subscribe({
        next: (response) => {
          console.log('Datos actualizados exitosamente:', response);
          this.showMessage = true;
          this.messageText = response.message;
          this.messageType = 'success';
          this.isEditing = false;
          this.isAnyEditing = false;
          setTimeout(() => (this.showMessage = false), 3000);
        },
        error: (error) => {
          console.error('Error al actualizar los datos:', error);
          this.showMessage = true;
          this.messageText = error.message;
          this.messageType = 'error';
          this.isEditing = false;
          this.isAnyEditing = false;
          this.formMixerMain.disable();
        },
      });
    } else {
      alert('Por favor, revisa los datos antes de guardar');
    }
  }

  saveChangesStatusA() {
    if (this.selectedInforme) {
      this.isSaving = true; // Activar el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      const idInforme = this.selectedInforme.idInforme;

      // Filtrar solo los ítems que han sido modificados
      const itemsToUpdate = this.itemsWithStatus
        .slice(0, 19)
        .filter((item, index) => {
          const originalItem = this.originalValues[index];
          return originalItem && item.idStatus !== originalItem.idStatus;
        });

      if (itemsToUpdate.length === 0) {
        console.log(
          'No se encontraron ítems modificados para actualizar en la tabla A.'
        );
        this.isSaving = false;
        return;
      }

      // array con los datos de los ítems
      const itemsData = itemsToUpdate.map((item) => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
        };

        // Si el estado es NO CUMPLE, llamar al método para agregar la descripción
        if (item.idStatus === 2) {
          const descripcionData = {
            descripcion: item.descripcionNoCumple || 'Descripción pendiente',
            idInforme: idInforme,
            idStatus: item.idStatus,
            idDetalle: item.idDetalle,
          };

          const descripcionesArray = {
            descripciones: [descripcionData],
          };

          this.addNotMetDescription(descripcionesArray); // Llamada al método post de descripciones
        }

        return itemData;
      });

      // Llamada al servicio para actualizar los ítems
      this.mixerService
        .editItemMixer(itemsData)
        .pipe()
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.isAnyEditing = false;
              // Actualizar la lista de no conformidades
              this.refreshNonConformities();
            } else {
              this.messageText =
                'Error al guardar algunos datos. Inténtalo de nuevo.';
              this.messageType = 'error';
              this.refreshStatus();
              this.restoreOriginalValues();
            }
          },
          error: (error) => {
            this.messageText =
              'Error al actualizar los datos. Inténtalo de nuevo.';
            this.messageType = 'error';
            console.error('Error actualizando los datos:', error);
            this.refreshStatus();
            this.restoreOriginalValues();
          },
          complete: () => {
            this.showMessage = true;
            setTimeout(() => (this.showMessage = false), 3000);
            this.isSaving = false; // Desactivar el spinner
            this.isEditingStatusA = false;
            this.isAnyEditing = false;
          },
        });
    }
  }

  saveChangesStatusB() {
    if (this.selectedInforme) {
      this.isSaving = true; // Activar el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      const idInforme = this.selectedInforme.idInforme;

      // Filtrar solo los ítems que han sido modificados, ajustando el índice
      const itemsToUpdate = this.itemsWithStatus
        .slice(19, 28)
        .filter((item, index) => {
          const globalIndex = 19 + index; // Ajustar el índice
          const originalItem = this.originalValues[globalIndex];
          return originalItem && item.idStatus !== originalItem.idStatus;
        });

      if (itemsToUpdate.length === 0) {
        console.log(
          'No se encontraron ítems modificados para actualizar en la tabla B.'
        );
        this.isSaving = false;
        return;
      }

      // array con los datos de los ítems
      const itemsData = itemsToUpdate.map((item) => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
        };

      // Si el estado es NO CUMPLE, llamar al método para agregar la descripción
        if (item.idStatus === 2) {
          const descripcionData = {
            descripcion: item.descripcionNoCumple || 'Descripción pendiente',
            idInforme: idInforme,
            idStatus: item.idStatus,
            idDetalle: item.idDetalle,
          };

          const descripcionesArray = {
            descripciones: [descripcionData],
          };

          this.addNotMetDescription(descripcionesArray); // Llamada al método post de descripciones
        }

        return itemData;
      });

      this.mixerService
        .editItemMixer(itemsData)
        .pipe()
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.isAnyEditing = false;
            } else {
              this.messageText =
                'Error al guardar algunos datos. Inténtalo de nuevo.';
              this.messageType = 'error';
              this.refreshStatus();
              this.restoreOriginalValues();
            }
          },
          error: (error) => {
            this.messageText =
              'Error al actualizar los datos. Inténtalo de nuevo.';
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

      // Filtrar solo los ítems que han sido modificados
      const itemsToUpdate = this.itemsWithStatus
        .slice(28, 39)
        .filter((item, index) => {
          const globalIndex = 28 + index; // Ajuste de índice
          const originalItem = this.originalValues[globalIndex];
          return originalItem && item.idStatus !== originalItem.idStatus;
        });

      if (itemsToUpdate.length === 0) {
        console.log(
          'No se encontraron ítems modificados para actualizar en la tabla C.'
        );
        this.isSaving = false;
        return;
      }

      // array con los datos de los ítems
      const itemsData = itemsToUpdate.map((item) => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
        };

      // Si el estado es NO CUMPLE, llamar al método para agregar la descripción
        if (item.idStatus === 2) {
          const descripcionData = {
            descripcion: item.descripcionNoCumple || 'Descripción pendiente',
            idInforme: idInforme,
            idStatus: item.idStatus,
            idDetalle: item.idDetalle,
          };

          const descripcionesArray = {
            descripciones: [descripcionData],
          };

          this.addNotMetDescription(descripcionesArray); // Llamada al método post de descripciones
        }

        return itemData;
      });

      this.mixerService
        .editItemMixer(itemsData)
        .pipe()
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.isAnyEditing = false;
            } else {
              this.messageText =
                'Error al guardar algunos datos. Inténtalo de nuevo.';
              this.messageType = 'error';
              this.refreshStatus();
              this.restoreOriginalValues();
            }
          },
          error: (error) => {
            this.messageText =
              'Error al actualizar los datos. Inténtalo de nuevo.';
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

      // Filtrar solo los ítems que han sido modificados
      const itemsToUpdate = this.itemsWithStatus
        .slice(39, 49)
        .filter((item, index) => {
          const globalIndex = 39 + index; // Ajuste de índice
          const originalItem = this.originalValues[globalIndex];
          return originalItem && item.idStatus !== originalItem.idStatus;
        });

      if (itemsToUpdate.length === 0) {
        console.log(
          'No se encontraron ítems modificados para actualizar en la tabla D.'
        );
        this.isSaving = false;
        return;
      }

      // array con los datos de los ítems
      const itemsData = itemsToUpdate.map((item) => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
        };

      // Si el estado es NO CUMPLE, llamar al método para agregar la descripción
        if (item.idStatus === 2) {
          const descripcionData = {
            descripcion: item.descripcionNoCumple || 'Descripción pendiente',
            idInforme: idInforme,
            idStatus: item.idStatus,
            idDetalle: item.idDetalle,
          };

          const descripcionesArray = {
            descripciones: [descripcionData],
          };

          this.addNotMetDescription(descripcionesArray); // Llamada al método post de descripciones
        }

        return itemData;
      });

      this.mixerService
        .editItemMixer(itemsData)
        .pipe()
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.isAnyEditing = false;
            } else {
              this.messageText =
                'Error al guardar algunos datos. Inténtalo de nuevo.';
              this.messageType = 'error';
              this.refreshStatus();
              this.restoreOriginalValues();
            }
          },
          error: (error) => {
            this.messageText =
              'Error al actualizar los datos. Inténtalo de nuevo.';
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

      // Filtrar solo los ítems que han sido modificados
      const itemsToUpdate = this.itemsWithStatus
        .slice(49, 60)
        .filter((item, index) => {
          const globalIndex = 49 + index; // Ajuste de índice
          const originalItem = this.originalValues[globalIndex];
          return originalItem && item.idStatus !== originalItem.idStatus;
        });

      if (itemsToUpdate.length === 0) {
        console.log(
          'No se encontraron ítems modificados para actualizar en la tabla E.'
        );
        this.isSaving = false;
        return;
      }

      // array con los datos de los ítems
      const itemsData = itemsToUpdate.map((item) => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
        };

      // Si el estado es NO CUMPLE, llamar al método para agregar la descripción
        if (item.idStatus === 2) {
          const descripcionData = {
            descripcion: item.descripcionNoCumple || 'Descripción pendiente',
            idInforme: idInforme,
            idStatus: item.idStatus,
            idDetalle: item.idDetalle,
          };

          const descripcionesArray = {
            descripciones: [descripcionData],
          };

          this.addNotMetDescription(descripcionesArray); // Llamada al método post de descripciones
        }

        return itemData;
      });

      this.mixerService
        .editItemMixer(itemsData)
        .pipe()
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.isAnyEditing = false;
            } else {
              this.messageText =
                'Error al guardar algunos datos. Inténtalo de nuevo.';
              this.messageType = 'error';
              this.refreshStatus();
              this.restoreOriginalValues();
            }
          },
          error: (error) => {
            this.messageText =
              'Error al actualizar los datos. Inténtalo de nuevo.';
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

      // Filtrar solo los ítems que han sido modificados
      const itemsToUpdate = this.itemsWithStatus
        .slice(60, 67)
        .filter((item, index) => {
          const globalIndex = 60 + index; // Ajuste de índice
          const originalItem = this.originalValues[globalIndex];
          return originalItem && item.idStatus !== originalItem.idStatus;
        });

      if (itemsToUpdate.length === 0) {
        console.log(
          'No se encontraron ítems modificados para actualizar en la tabla F.'
        );
        this.isSaving = false;
        return;
      }

      // array con los datos de los ítems
      const itemsData = itemsToUpdate.map((item) => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
        };

      // Si el estado es NO CUMPLE, llamar al método para agregar la descripción
        if (item.idStatus === 2) {
          const descripcionData = {
            descripcion: item.descripcionNoCumple || 'Descripción pendiente',
            idInforme: idInforme,
            idStatus: item.idStatus,
            idDetalle: item.idDetalle,
          };

          const descripcionesArray = {
            descripciones: [descripcionData],
          };

          this.addNotMetDescription(descripcionesArray); // Llamada al método post de descripciones
        }

        return itemData;
      });

      this.mixerService
        .editItemMixer(itemsData)
        .pipe()
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.isAnyEditing = false;
            } else {
              this.messageText =
                'Error al guardar algunos datos. Inténtalo de nuevo.';
              this.messageType = 'error';
              this.refreshStatus();
              this.restoreOriginalValues();
            }
          },
          error: (error) => {
            this.messageText =
              'Error al actualizar los datos. Inténtalo de nuevo.';
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

  saveChangesStatusG() {
    if (this.selectedInforme) {
      this.isSaving = true; // Activar el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      const idInforme = this.selectedInforme.idInforme;

      // Filtrar solo los ítems que han sido modificados
      const itemsToUpdate = this.itemsWithStatus
        .slice(67, 72)
        .filter((item, index) => {
          const globalIndex = 67 + index; // Ajuste de índice
          const originalItem = this.originalValues[globalIndex];
          return originalItem && item.idStatus !== originalItem.idStatus;
        });

      if (itemsToUpdate.length === 0) {
        console.log(
          'No se encontraron ítems modificados para actualizar en la tabla G.'
        );
        this.isSaving = false;
        return;
      }

      // array con los datos de los ítems
      const itemsData = itemsToUpdate.map((item) => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
        };

      // Si el estado es NO CUMPLE, llamar al método para agregar la descripción
        if (item.idStatus === 2) {
          const descripcionData = {
            descripcion: item.descripcionNoCumple || 'Descripción pendiente',
            idInforme: idInforme,
            idStatus: item.idStatus,
            idDetalle: item.idDetalle,
          };

          const descripcionesArray = {
            descripciones: [descripcionData],
          };

          this.addNotMetDescription(descripcionesArray); // Llamada al método post de descripciones
        }

        return itemData;
      });

      this.mixerService
        .editItemMixer(itemsData)
        .pipe()
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.isAnyEditing = false;
            } else {
              this.messageText =
                'Error al guardar algunos datos. Inténtalo de nuevo.';
              this.messageType = 'error';
              this.refreshStatus();
              this.restoreOriginalValues();
            }
          },
          error: (error) => {
            this.messageText =
              'Error al actualizar los datos. Inténtalo de nuevo.';
            this.messageType = 'error';
            console.error('Error actualizando los datos:', error);
            this.refreshStatus();
            this.restoreOriginalValues();
          },
          complete: () => {
            this.showMessage = true;
            setTimeout(() => (this.showMessage = false), 3000);
            this.isSaving = false; // Desactivar el spinner
            this.isEditingStatusG = false;
            this.isAnyEditing = false;
          },
        });
    }
  }

  saveChangesStatusH() {
    if (this.selectedInforme) {
      this.isSaving = true; // Activar el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      const idInforme = this.selectedInforme.idInforme;

      // Filtrar solo los ítems que han sido modificados
      const itemsToUpdate = this.itemsWithStatus
        .slice(72, 87)
        .filter((item, index) => {
          const globalIndex = 72 + index; // Ajuste de índice
          const originalItem = this.originalValues[globalIndex];
          return originalItem && item.idStatus !== originalItem.idStatus;
        });

      if (itemsToUpdate.length === 0) {
        console.log(
          'No se encontraron ítems modificados para actualizar en la tabla H.'
        );
        this.isSaving = false;
        return;
      }

      // array con los datos de los ítems
      const itemsData = itemsToUpdate.map((item) => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
        };

      // Si el estado es NO CUMPLE, llamar al método para agregar la descripción
        if (item.idStatus === 2) {
          const descripcionData = {
            descripcion: item.descripcionNoCumple || 'Descripción pendiente',
            idInforme: idInforme,
            idStatus: item.idStatus,
            idDetalle: item.idDetalle,
          };

          const descripcionesArray = {
            descripciones: [descripcionData],
          };

          this.addNotMetDescription(descripcionesArray); // Llamada al método post de descripciones
        }

        return itemData;
      });

      this.mixerService
        .editItemMixer(itemsData)
        .pipe()
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.isAnyEditing = false;
            } else {
              this.messageText =
                'Error al guardar algunos datos. Inténtalo de nuevo.';
              this.messageType = 'error';
              this.refreshStatus();
              this.restoreOriginalValues();
            }
          },
          error: (error) => {
            this.messageText =
              'Error al actualizar los datos. Inténtalo de nuevo.';
            this.messageType = 'error';
            console.error('Error actualizando los datos:', error);
            this.refreshStatus();
            this.restoreOriginalValues();
          },
          complete: () => {
            this.showMessage = true;
            setTimeout(() => (this.showMessage = false), 3000);
            this.isSaving = false; // Desactivar el spinner
            this.isEditingStatusH = false;
            this.isAnyEditing = false;
          },
        });
    }
  }

  saveChangesStatusI() {
    if (this.selectedInforme) {
      this.isSaving = true; // Activar el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      const idInforme = this.selectedInforme.idInforme;

      // Filtrar solo los ítems que han sido modificados
      const itemsToUpdate = this.itemsWithStatus
        .slice(87, 96)
        .filter((item, index) => {
          const globalIndex = 87 + index; // Ajuste de índice
          const originalItem = this.originalValues[globalIndex];
          return originalItem && item.idStatus !== originalItem.idStatus;
        });

      if (itemsToUpdate.length === 0) {
        console.log(
          'No se encontraron ítems modificados para actualizar en la tabla I.'
        );
        this.isSaving = false;
        return;
      }

      // array con los datos de los ítems
      const itemsData = itemsToUpdate.map((item) => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
        };

      // Si el estado es NO CUMPLE, llamar al método para agregar la descripción
        if (item.idStatus === 2) {
          const descripcionData = {
            descripcion: item.descripcionNoCumple || 'Descripción pendiente',
            idInforme: idInforme,
            idStatus: item.idStatus,
            idDetalle: item.idDetalle,
          };

          const descripcionesArray = {
            descripciones: [descripcionData],
          };

          this.addNotMetDescription(descripcionesArray); // Llamada al método post de descripciones
        }

        return itemData;
      });

      this.mixerService
        .editItemMixer(itemsData)
        .pipe()
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.isAnyEditing = false;
            } else {
              this.messageText =
                'Error al guardar algunos datos. Inténtalo de nuevo.';
              this.messageType = 'error';
              this.refreshStatus();
              this.restoreOriginalValues();
            }
          },
          error: (error) => {
            this.messageText =
              'Error al actualizar los datos. Inténtalo de nuevo.';
            this.messageType = 'error';
            console.error('Error actualizando los datos:', error);
            this.refreshStatus();
            this.restoreOriginalValues();
          },
          complete: () => {
            this.showMessage = true;
            setTimeout(() => (this.showMessage = false), 3000);
            this.isSaving = false; // Desactivar el spinner
            this.isEditingStatusI = false;
            this.isAnyEditing = false;
          },
        });
    }
  }

  saveChangesStatusJ() {
    if (this.selectedInforme) {
      this.isSaving = true; // Activar el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      const idInforme = this.selectedInforme.idInforme;

      // Filtrar solo los ítems que han sido modificados
      const itemsToUpdate = this.itemsWithStatus
        .slice(96, 101)
        .filter((item, index) => {
          const globalIndex = 96 + index; // Ajuste de índice
          const originalItem = this.originalValues[globalIndex];
          return originalItem && item.idStatus !== originalItem.idStatus;
        });

      if (itemsToUpdate.length === 0) {
        console.log(
          'No se encontraron ítems modificados para actualizar en la tabla J.'
        );
        this.isSaving = false;
        return;
      }

      // array con los datos de los ítems
      const itemsData = itemsToUpdate.map((item) => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
        };

      // Si el estado es NO CUMPLE, llamar al método para agregar la descripción
        if (item.idStatus === 2) {
          const descripcionData = {
            descripcion: item.descripcionNoCumple || 'Descripción pendiente',
            idInforme: idInforme,
            idStatus: item.idStatus,
            idDetalle: item.idDetalle,
          };

          const descripcionesArray = {
            descripciones: [descripcionData],
          };

          this.addNotMetDescription(descripcionesArray); // Llamada al método post de descripciones
        }

        return itemData;
      });

      this.mixerService
        .editItemMixer(itemsData)
        .pipe()
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.isAnyEditing = false;
            } else {
              this.messageText =
                'Error al guardar algunos datos. Inténtalo de nuevo.';
              this.messageType = 'error';
              this.refreshStatus();
              this.restoreOriginalValues();
            }
          },
          error: (error) => {
            this.messageText =
              'Error al actualizar los datos. Inténtalo de nuevo.';
            this.messageType = 'error';
            console.error('Error actualizando los datos:', error);
            this.refreshStatus();
            this.restoreOriginalValues();
          },
          complete: () => {
            this.showMessage = true;
            setTimeout(() => (this.showMessage = false), 3000);
            this.isSaving = false; // Desactivar el spinner
            this.isEditingStatusJ = false;
            this.isAnyEditing = false;
          },
        });
    }
  }

  saveChangesStatusK() {
    if (this.selectedInforme) {
      this.isSaving = true; // Activar el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      const idInforme = this.selectedInforme.idInforme;

      // Filtrar solo los ítems que han sido modificados
      const itemsToUpdate = this.itemsWithStatus
        .slice(101, 106)
        .filter((item, index) => {
          const globalIndex = 101 + index; // Ajuste de índice
          const originalItem = this.originalValues[globalIndex];
          return originalItem && item.idStatus !== originalItem.idStatus;
        });

      if (itemsToUpdate.length === 0) {
        console.log(
          'No se encontraron ítems modificados para actualizar en la tabla K.'
        );
        this.isSaving = false;
        return;
      }

      // array con los datos de los ítems
      const itemsData = itemsToUpdate.map((item) => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
        };

      // Si el estado es NO CUMPLE, llamar al método para agregar la descripción
        if (item.idStatus === 2) {
          const descripcionData = {
            descripcion: item.descripcionNoCumple || 'Descripción pendiente',
            idInforme: idInforme,
            idStatus: item.idStatus,
            idDetalle: item.idDetalle,
          };

          const descripcionesArray = {
            descripciones: [descripcionData],
          };

          this.addNotMetDescription(descripcionesArray); // Llamada al método post de descripciones
        }

        return itemData;
      });

      this.mixerService
        .editItemMixer(itemsData)
        .pipe()
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.isAnyEditing = false;
            } else {
              this.messageText =
                'Error al guardar algunos datos. Inténtalo de nuevo.';
              this.messageType = 'error';
              this.refreshStatus();
              this.restoreOriginalValues();
            }
          },
          error: (error) => {
            this.messageText =
              'Error al actualizar los datos. Inténtalo de nuevo.';
            this.messageType = 'error';
            console.error('Error actualizando los datos:', error);
            this.refreshStatus();
            this.restoreOriginalValues();
          },
          complete: () => {
            this.showMessage = true;
            setTimeout(() => (this.showMessage = false), 3000);
            this.isSaving = false; // Desactivar el spinner
            this.isEditingStatusK = false;
            this.isAnyEditing = false;
          },
        });
    }
  }

  saveChangesStatusL() {
    if (this.selectedInforme) {
      this.isSaving = true; // Activar el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      const idInforme = this.selectedInforme.idInforme;

      // Filtrar solo los ítems que han sido modificados
      const itemsToUpdate = this.itemsWithStatus
        .slice(106, 113)
        .filter((item, index) => {
          const globalIndex = 106 + index; // Ajuste de índice
          const originalItem = this.originalValues[globalIndex];
          return originalItem && item.idStatus !== originalItem.idStatus;
        });

      if (itemsToUpdate.length === 0) {
        console.log(
          'No se encontraron ítems modificados para actualizar en la tabla L.'
        );
        this.isSaving = false;
        return;
      }

      // array con los datos de los ítems
      const itemsData = itemsToUpdate.map((item) => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
        };

      // Si el estado es NO CUMPLE, llamar al método para agregar la descripción
        if (item.idStatus === 2) {
          const descripcionData = {
            descripcion: item.descripcionNoCumple || 'Descripción pendiente',
            idInforme: idInforme,
            idStatus: item.idStatus,
            idDetalle: item.idDetalle,
          };

          const descripcionesArray = {
            descripciones: [descripcionData],
          };

          this.addNotMetDescription(descripcionesArray); // Llamada al método post de descripciones
        }

        return itemData;
      });

      this.mixerService
        .editItemMixer(itemsData)
        .pipe()
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.isAnyEditing = false;
            } else {
              this.messageText =
                'Error al guardar algunos datos. Inténtalo de nuevo.';
              this.messageType = 'error';
              this.refreshStatus();
              this.restoreOriginalValues();
            }
          },
          error: (error) => {
            this.messageText =
              'Error al actualizar los datos. Inténtalo de nuevo.';
            this.messageType = 'error';
            console.error('Error actualizando los datos:', error);
            this.refreshStatus();
            this.restoreOriginalValues();
          },
          complete: () => {
            this.showMessage = true;
            setTimeout(() => (this.showMessage = false), 3000);
            this.isSaving = false; // Desactivar el spinner
            this.isEditingStatusL = false;
            this.isAnyEditing = false;
          },
        });
    }
  }

  saveChangesStatusM() {
    if (this.selectedInforme) {
      this.isSaving = true; // Activar el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      const idInforme = this.selectedInforme.idInforme;

      // Filtrar solo los ítems que han sido modificados
      const itemsToUpdate = this.itemsWithStatus
        .slice(113, 123)
        .filter((item, index) => {
          const globalIndex = 113 + index; // Ajuste de índice
          const originalItem = this.originalValues[globalIndex];
          return originalItem && item.idStatus !== originalItem.idStatus;
        });

      if (itemsToUpdate.length === 0) {
        console.log(
          'No se encontraron ítems modificados para actualizar en la tabla M.'
        );
        this.isSaving = false;
        return;
      }

      // array con los datos de los ítems
      const itemsData = itemsToUpdate.map((item) => {
        const itemData = {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
        };

      // Si el estado es NO CUMPLE, llamar al método para agregar la descripción
        if (item.idStatus === 2) {
          const descripcionData = {
            descripcion: item.descripcionNoCumple || 'Descripción pendiente',
            idInforme: idInforme,
            idStatus: item.idStatus,
            idDetalle: item.idDetalle,
          };

          const descripcionesArray = {
            descripciones: [descripcionData],
          };

          this.addNotMetDescription(descripcionesArray); // Llamada al método post de descripciones
        }

        return itemData;
      });

      this.mixerService
        .editItemMixer(itemsData)
        .pipe()
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.isAnyEditing = false;
            } else {
              this.messageText =
                'Error al guardar algunos datos. Inténtalo de nuevo.';
              this.messageType = 'error';
              this.refreshStatus();
              this.restoreOriginalValues();
            }
          },
          error: (error) => {
            this.messageText =
              'Error al actualizar los datos. Inténtalo de nuevo.';
            this.messageType = 'error';
            console.error('Error actualizando los datos:', error);
            this.refreshStatus();
            this.restoreOriginalValues();
          },
          complete: () => {
            this.showMessage = true;
            setTimeout(() => (this.showMessage = false), 3000);
            this.isSaving = false; // Desactivar el spinner
            this.isEditingStatusM = false;
            this.isAnyEditing = false;
          },
        });
    }
  }

  saveChangesTorque() {
    const descriptionData = {
      idInforme: this.selectedInforme.idInforme,
      descripcionTorque: this.torqueDescription.descripcionTorque,
    };

    this.mixerService.editTorqueMixer(descriptionData).subscribe({
      next: (response) => {
        if (response.success) {
          this.showMessage = true;
          this.messageText = 'Descripción actualizada exitosamente.';
          this.messageType = 'success';
          this.isAnyEditing = false;
        } else {
          this.messageText = 'Error al actualizar la descripción.';
          this.messageType = 'error';
        }
      },
      error: (error) => {
        this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
        this.messageType = 'error';
        console.error('Error actualizando los datos:', error);
      },
      complete: () => {
        this.showMessage = true;
        setTimeout(() => (this.showMessage = false), 3000);
        this.isEditingTorque = false;
        this.isAnyEditing = false;
      },
    });
  }

  onTorqueDescriptionChange(value: string) {
    this.torqueDescription.descripcionTorque = value;
  }

  saveChangesBetonera() {
    if (this.selectedInforme) {
      this.isSaving = true; // Activar el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      const idInforme = this.selectedInforme.idInforme;

      const betoneraDataToUpdate = {
        ...this.originalValues, // Mantener los campos no modificados
        ...Object.keys(this.betoneraData).reduce((acc, key) => {
          if (this.betoneraData[key] !== this.originalValues[key]) {
            acc[key] = this.betoneraData[key]; // Solo sobrescribir los campos modificados
          }
          return acc;
        }, {} as Record<string, any>),
      };

      // Agregar idInforme al objeto de actualización
      betoneraDataToUpdate['idInforme'] = idInforme;

      if (Object.keys(betoneraDataToUpdate).length === 0) {
        console.log('No se encontraron campos modificados para actualizar.');
        this.isSaving = false;
        this.isEditingBetonera = false;
        return;
      }

      console.log('Betonera data to update:', betoneraDataToUpdate);

      // Llamada al servicio para actualizar los datos
      this.mixerService.editBetoneraMixer(betoneraDataToUpdate).subscribe({
        next: (response) => {
          if (response.success) {
            this.showMessage = true;
            this.messageText = 'Datos actualizados exitosamente.';
            this.messageType = 'success';
            this.isAnyEditing = false;
          } else {
            this.messageText =
              'Error al guardar algunos datos. Inténtalo de nuevo.';
            this.messageType = 'error';
          }
        },
        error: (error) => {
          this.messageText =
            'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          console.error('Error actualizando los datos:', error);
        },
        complete: () => {
          this.showMessage = true;
          setTimeout(() => (this.showMessage = false), 3000);
          this.isSaving = false; // Desactivar el spinner
          this.isEditingBetonera = false;
          this.isAnyEditing = false;
        },
      });
    }
  }

  saveChangesDescription() {
    if (this.selectedInforme) {
      this.isSaving = true; // Activar el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      const descripcionesToUpdate = this.nonConformities
        .map((observation, index) => {
          const descripcionNueva = this.formMixerMain.get(
            `descripcion_${index}`
          )?.value;
          if (descripcionNueva !== observation.descripcion) {
            return {
              descripcion: descripcionNueva, // Solo agrega si hay cambios
              idInforme: this.selectedInforme.idInforme,
              idDetalle: observation.idDetalle,
            };
          }
          return null;
        })
        .filter((item) => item !== null); // Filtrar nulos si no hay cambios

      if (descripcionesToUpdate.length === 0) {
        console.log(
          'No se encontraron descripciones modificadas para actualizar.'
        );
        this.isSaving = false;
        this.isEditingDescription = false;
        return;
      }

      let success = true;

      // Llamada al método PUT para editar las descripciones
      descripcionesToUpdate.forEach((descripcionData) => {
        this.mixerService.editDescripcionMixer(descripcionData).subscribe({
          next: (response) => {
            if (!response.success) {
              success = false;
              console.error(
                'Error al actualizar algunas descripciones:',
                response.message
              );
            }
          },
          error: (error) => {
            success = false;
            console.error('Error al actualizar algunas descripciones:', error);
          },
          complete: () => {
            if (success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.refreshNonConformities();
              this.isAnyEditing = false;
            } else {
              this.messageText =
                'Error al guardar algunos datos. Inténtalo de nuevo.';
              this.messageType = 'error';
            }

            this.isSaving = false;
            this.isEditingDescription = false;
            setTimeout(() => (this.showMessage = false), 3000);
          },
        });
      });
    }
  }

  saveChangesResult() {
    if (this.selectedInforme) {
      // Actualizamos solo el campo idResul en el objeto selectedInforme
      const updatedInforme = {
        ...this.selectedInforme, // Clonamos el objeto actual
        idResul: this.formMixerMain.get('idResul')?.value, // Actualizamos solo el idResul
      };

      // Llamada al servicio para actualizar el informe completo con el idResul actualizado
      this.mixerService.editInformeMixer(updatedInforme).subscribe({
        next: (response) => {
          if (response.success) {
            this.showMessage = true;
            this.messageText = 'El resultado ha sido actualizado exitosamente.';
            this.messageType = 'success';
            this.isEditingResult = false; // Salir del modo edición
            this.isAnyEditing = false; // Permitir edición de otras secciones
          } else {
            this.messageText =
              'Error al guardar el resultado. Inténtalo de nuevo.';
            this.messageType = 'error';
          }
        },
        error: (error) => {
          console.error('Error al actualizar el resultado:', error);
          this.messageText =
            'Error al actualizar el resultado. Inténtalo de nuevo.';
          this.messageType = 'error';
        },
        complete: () => {
          setTimeout(() => (this.showMessage = false), 3000);
        },
      });
    }
  }

  // Método para formatear la fecha
  formatDate(date: string | Date): string {
    return this.datePipe.transform(date, 'dd-MM-yyyy') || '';
  }

  // Método para calcular el próximo control
  getNextControlDate(fechaInspeccion: string): string {
    const proximoControl = new Date(fechaInspeccion);
    proximoControl.setFullYear(proximoControl.getFullYear() + 1);

    // Sumar un día a la fecha del próximo control
    proximoControl.setDate(proximoControl.getDate() + 1);
    return this.formatDate(proximoControl);
  }

  openModal(item: any): void {
    const idInforme = this.selectedInforme.idInforme;
    const numeroInforme = this.formMixerMain.get('numeroInforme')?.value;
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

    // Mostrar el modal
    this.showModal = true;
    this.currentItemIndex = this.itemsWithStatus.indexOf(item);

    // Agregar logs para verificar la correcta asignación
    console.log('Modal abierto con los siguientes datos:');
    console.log('idInforme:', idInforme);
    console.log('numeroInforme:', numeroInforme);
    console.log('idDetalle:', idDetalle);
    console.log('idStatus:', idStatus);
  }

  closeModal(modalData: { description: string; images: string[]; imagesNames:any[] }): void {
    if (this.currentItemIndex !== null) {
      const currentItem = this.itemsWithStatus[this.currentItemIndex];
      currentItem.descripcionNoCumple = modalData.description;
      currentItem.images = modalData.images;
      currentItem.imagesNames = modalData.imagesNames;

      if (currentItem.idStatus === 2) {
        currentItem.alias = 'N/C';
      } else {
        currentItem.idStatus = 1; // Asignar CU si no se selecciona N/C
        currentItem.alias = 'CU';
      }
    }

    this.showModal = false;
    this.currentItemIndex = null;
    this.cdr.detectChanges(); // Forzar actualización visual
  }

  cancelModal(): void {
    // Restaurar el estado original del ítem si se cancela el modal
    if (this.currentItemIndex !== null && this.originalStatus) {
      this.itemsWithStatus[this.currentItemIndex] = { ...this.originalStatus };
    }

    this.showModal = false;
    this.currentItemIndex = null;
    this.currentDescription = '';
    this.cdr.detectChanges(); // Forzar actualización visual
  }

  // Método para eliminar la descripción y las fotos asociadas
  deleteDescriptionAndPhotos(item: any) {
    const idInforme = this.selectedInforme.idInforme;
    const idDetalle = item.idDetalle;
    const idStatus = item.idStatus;

    // Asegúrate de que los valores están correctos
    console.log('Datos enviados al eliminar descripción:', {
      idInforme,
      idDetalle,
      idStatus,
    });

    console.log('idInforme:', idInforme, 'Tipo:', typeof idInforme);
    console.log('idDetalle:', idDetalle, 'Tipo:', typeof idDetalle);
    console.log('idStatus:', idStatus, 'Tipo:', typeof idStatus);

    // Objeto para eliminar la descripción
    const descripcionData = {
      idInforme: idInforme,
      idDetalle: idDetalle,
      idStatus: idStatus,
    };

    this.mixerService.deleteDescripcionMixer(descripcionData).subscribe({
      next: (response) => {
        console.log('Descripción eliminada:', response);
      },
      error: (error) => {
        console.error('Error al eliminar la descripción:', error);
      },
    });

    if (item.imagesNames && item.images && item.images.length > 0) {
      item.imagesNames.forEach((fotoNombre: string) => {
        const fotoData = {
          idInforme: idInforme,
          idDetalle: idDetalle,
          foto: fotoNombre,
          numeroInforme: this.selectedInforme.numeroInforme,
        };

        this.mixerService.deleteFotoMixer(fotoData).subscribe({
          next: (response) => {
            console.log('Foto eliminada:', response);
          },
          error: (error) => {
            console.error('Error al eliminar la foto:', error);
          },
        });
      });
    } else {
      console.log('No se encontraron fotos para eliminar.');
    }
  }
}
