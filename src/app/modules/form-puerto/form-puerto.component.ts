import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PuertoService } from './services/puerto.service';
import { PdfService } from '../../services/pdf.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { lastValueFrom, Subject, take, takeUntil } from 'rxjs';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-form-puerto',
  templateUrl: './form-puerto.component.html',
  styleUrl: './form-puerto.component.scss',
})
export class FormPuertoComponent implements OnInit, OnDestroy {
  informes: any[] = [];
  informeForm: FormGroup;
  formE: FormGroup;
  formE1: FormGroup;
  modalInstance: any = null;
  deletedPhoto: any = null;
  selectedInforme: any | null = null;
  fechaEmisionInforme: string | null = null;
  currentItemIndex: number | null = null;
  itemsWithStatus: any[] = [];
  itemsWithDetail: any[] = [];
  descripcionItems: any[] = [];
  tituloForm: any[] = [];
  originalValues: any;
  originalStatus: any;
  selecInforme: any;
  selecDetalle: any;
  selecStatus: any;
  selecNumInforme: any;
  formEData: any;
  formE1Data: any;
  photos: any;
  isEditingStatusA = false;
  isEditingStatusB = false;
  isEditingStatusC = false;
  isEditingFormD = false;
  isEditingFormE = false;
  isEditingFormE1 = false;
  isEditingFormF = false;
  isEditingImages = false;
  isLoading = false;
  isLoadingPdf = false;
  isSaving = false;
  isEditing = false;
  isPreviewMode = false;
  showHeaderFooter = false;
  allowImages = false;
  showModal = false;
  showSetFotograficoModal = false;
  isAnyEditing = false;
  showMessage = false;
  showGanchoPrincipal = false;
  showGanchoAuxiliar = false;
  showGanchoAuxiliarE1 = false;
  showGanchoTres = false;
  messageType: 'success' | 'error' | 'warning' = 'success';
  messageText = '';
  savingMessage = '';
  optionStatus = [
    { idStatus: 1, alias: 'CU' },
    { idStatus: 2, alias: 'N/C' },
    { idStatus: 3, alias: 'N/A' },
    { idStatus: 4, alias: 'RE' },
  ];
  maxPhotoNumber: number = 0;
  photoDescriptionsForm!: FormGroup;
  defaultEmptyRows = new Array(7);
  onAccept: () => void = () => {};
  onCancel: () => void = () => {};
  private destroy$ = new Subject<void>();

  constructor(
    private puertoService: PuertoService,
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.informeForm = this.createFormGroup();
    this.formE = this.createFormE();
    this.formE1 = this.createFormE1();
    this.photoDescriptionsForm = this.formBuilder.group({});
  }

  private createPhotoDescriptionsForm() {
  const group: any = {};
  this.photos.forEach((photo: { descripcionSF: string, numero: number }) => {
    group[`descripcionSF_${photo.numero}`] = new FormControl(photo.descripcionSF || '');
  });
  this.photoDescriptionsForm = this.formBuilder.group(group);
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

  deselectInforme() {
    this.selectedInforme = null;
    this.informeForm.reset();
    this.cdr.detectChanges();
  }

  currentDate() {
    const currentDate = new Date();
    this.fechaEmisionInforme = this.datePipe.transform(
      currentDate,
      'dd-MM-yyyy'
    );
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

  private createFormGroup(): FormGroup {
    return this.formBuilder.group({
      numeroInforme: [''],
      empresa: [''],
      persona: [''],
      equipo: [''],
      marca: [''],
      cargaSegura: [''],
      angulo: [''],
      radio: [''],
      cargaSeguraDo: [''],
      anguloDos: [''],
      radioDos: [''],
      fechaFabricacion: [''],
      numeroSerie: [''],
      lugarInspeccion: [''],
      fechaInspeccion: [''],
      estado: [''],
      idResul: [''],
      tag: [''],
    });
  }

  private createFormE(): FormGroup {
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
      nivelTopografico: [''],
      nivelTopograficoNCertificado: [''],
      otro: [''],
      otroNCertificado: [''],
      descripcionOtro: [''],
      ganchoPrincipal: [''],
      ganchoAuxiliar: [''],
      nombreOperador: [''],
      radioPC: [''],
      anguloPC: [''],
      cargaPruebaAplicada: [''],
      porcentajeCapacidadNominal: [''],
      radioPCPrin: [''],
      anguloPCPrin: [''],
      cargaPruebaAplicadaPrin: [''],
      porcentajeCapacidadNominalPrin: [''],
      radioPCAux: [''],
      anguloPCAux: [''],
      cargaPruebaAplicadaAux: [''],
      porcentajeCapacidadNominalAux: [''],
      comentarios: ['', [Validators.maxLength(500)]],
      nombreRutInspector: ['', [Validators.maxLength(100)]],
    });
  }

  private createFormE1(): FormGroup {
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

  async getNumeroInformes() {
    await this.puertoService
      .getRegistroFormPuerto()
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
    this.puertoService
      .getInformePuertoByID(informe.idInforme)
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
          this.loadFormE(informe.idInforme);
          this.loadFormE1(informe.idInforme);
          this.loadSetFotografico(informe.idInforme);
        },
        error: (error) => {
          console.error('Error fetching informe details:', error);
        },
      });
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

  private getTitulosForm() {
    this.puertoService
      .getNombreFormPuerto()
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
    this.puertoService
      .getItemPuertoByIdInforme(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.loadItemStatus(items);
          this.loadDetail(items);
          this.loadNonConformities(idInforme);

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
    this.puertoService
      .getStatusPuerto()
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
    this.puertoService
      .getDetallePuerto()
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
      const previousStatus = item.idStatus; // Guardamos el estado anterior
      const previousAlias = item.alias; // Guardamos el alias anterior

      // Mensaje de confirmación según el estado previo
      const confirmMessage =
        previousStatus === 2 && ['1', '3', '4'].includes(selectedIdStatus)
          ? '¿Estás seguro de cambiar el estado de N/C? Esto eliminará las imágenes y la descripción asociadas a este ítem.'
          : previousStatus === 4 && ['1', '2', '3'].includes(selectedIdStatus)
          ? '¿Estás seguro de cambiar el estado de RE? Esto eliminará la descripción asociada a este ítem.'
          : null;

      if (confirmMessage) {
        // Mostrar mensaje de advertencia
        this.showWarningMessage(confirmMessage).then((confirmed) => {
          if (confirmed) {
            // Aplicar el cambio de estado solo si el usuario confirma
            this.handleStatusChange(item, selectedIdStatus, previousStatus);
          } else {
            // Si el usuario cancela, revertimos el estado a su valor anterior
            item.idStatus = previousStatus;
            item.alias = previousAlias;
            this.cdr.detectChanges(); // Forzar la actualización visual
          }
        });
      } else {
        // Si no es necesario confirmar, aplicar el cambio directamente
        this.handleStatusChange(item, selectedIdStatus, previousStatus);
      }
    }
  }

  handleStatusChange(
    item: any,
    selectedIdStatus: string,
    previousStatus: number
  ): void {
    // Solo realizamos la eliminación de fotos o descripciones después de confirmar el cambio
    if (previousStatus === 2 && selectedIdStatus === '4') {
      // De N/C a RE (Eliminar fotos y descripción)
      this.deletePhotosAndDescription(item, previousStatus);
      item.idStatus = 4;
      item.alias = 'RE';
      this.openModal(item, false); // Abrir modal para ingresar una nueva descripción
    } else if (previousStatus === 4 && selectedIdStatus === '2') {
      // De RE a N/C (Eliminar solo la descripción)
      this.deleteDescription(item, previousStatus);
      item.idStatus = 2;
      item.alias = 'N/C';
      this.openModal(item, true); // Abrir modal para ingresar descripción e imágenes
    } else if (previousStatus === 2 && ['1', '3'].includes(selectedIdStatus)) {
      // De N/C a CU o N/A (Eliminar fotos y descripción)
      this.deletePhotosAndDescription(item, previousStatus);
      item.idStatus = selectedIdStatus === '1' ? 1 : 3;
      item.alias = selectedIdStatus === '1' ? 'CU' : 'N/A';
      item.descripcionNoCumple = ''; // Limpiar la descripción
      item.images = []; // Limpiar las imágenes asociadas
      item.imagesNames = []; // Limpiar los nombres de las imágenes
    } else if (previousStatus === 4 && ['1', '3'].includes(selectedIdStatus)) {
      // De RE a CU o N/A (Eliminar solo la descripción)
      this.deleteDescription(item, previousStatus);
      item.idStatus = selectedIdStatus === '1' ? 1 : 3;
      item.alias = selectedIdStatus === '1' ? 'CU' : 'N/A';
      item.descripcionNoCumple = ''; // Limpiar la descripción
    } else if (selectedIdStatus === '2' || selectedIdStatus === '4') {
      // Si es RE o N/C, abrir el modal con la lógica correspondiente
      item.idStatus = selectedIdStatus;
      item.alias = selectedIdStatus === '2' ? 'N/C' : 'RE';
      const requireImages = selectedIdStatus === '2'; // Si es N/C, requiere imágenes
      this.openModal(item, requireImages); // Abrir modal para RE o N/C según sea necesario
    } else {
      // Otros cambios de estado (CU, N/A)
      item.idStatus = selectedIdStatus === '1' ? 1 : 3;
      item.alias = selectedIdStatus === '1' ? 'CU' : 'N/A';
    }

    this.cdr.detectChanges(); // Forzar la actualización visual
  }

  // Eliminar fotos y descripción para el caso N/C a CU o N/A
  async deletePhotosAndDescription(item: any, originalStatus: number) {
    await this.deletePhotos(item);
    await this.deleteDescription(item, originalStatus);
  }

  async deleteDescription(item: any, originalStatus: number) {
    const idInforme = this.selectedInforme.idInforme;
    const idDetalle = item.idDetalle;

    try {
      const descripcionData = {
        idInforme,
        idDetalle,
        idStatus: originalStatus,
      };
      const descripcionResponse = await lastValueFrom(
        this.puertoService.deleteDescripcionPuerto(descripcionData)
      );

      if (descripcionResponse.success) {
        console.log('Descripción eliminada exitosamente.');
      } else {
        console.error(
          'Error al eliminar la descripción:',
          descripcionResponse.message
        );
      }
    } catch (error) {
      console.error('Error al eliminar la descripción:', error);
    }
  }

  // Método para eliminar solo las fotos
  async deletePhotos(item: any) {
    const idInforme = this.selectedInforme.idInforme;
    const idDetalle = item.idDetalle;
    const numeroInforme = this.selectedInforme.numeroInforme;

    try {
      const fotosResponse = await lastValueFrom(
        this.puertoService.getFotoByIdInformePuerto(idInforme)
      );

      if (fotosResponse && fotosResponse.photos) {
        const fotosFiltradas = fotosResponse.photos.filter(
          (foto: any) => foto.idDetalle === idDetalle
        );

        if (fotosFiltradas.length > 0) {
          for (const foto of fotosFiltradas) {
            const fotoData = {
              idInforme: idInforme,
              idDetalle: idDetalle,
              numeroInforme: numeroInforme,
              foto: foto.foto,
            };
            await lastValueFrom(
              this.puertoService.deleteFotoPuertoByIdDetalle(fotoData)
            );
            console.log(`Foto eliminada para idDetalle: ${idDetalle}`);
          }
        } else {
          console.log('No se encontraron fotos para eliminar.');
        }
      } else {
        console.log('No se encontraron fotos en el backend.');
      }
    } catch (error) {
      console.error('Error al eliminar las fotos:', error);
    }
  }

  private loadFormE(idInforme: number) {
    this.puertoService
      .getformEPuertoByIdInforme(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.formEData = data[0];

          this.formE.patchValue({
            ...this.formEData,
          });
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching form H data:', error);
        },
      });
  }

  private loadFormE1(idInforme: number) {
    this.puertoService
      .getformE1PuertoByIdInforme(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.formE1Data = data[0];

          this.formE1.patchValue({
            longitudUABAntes: this.formE1Data.longitudUABAntes,
            longitudUABDesp: this.formE1Data.longitudUABDesp,
            longitudDBCAntes: this.formE1Data.longitudDBCAntes,
            longitudDBCDesp: this.formE1Data.longitudDBCDesp,
            longitudTABAntes: this.formE1Data.longitudTABAntes,
            longitudTABDesp: this.formE1Data.longitudTABDesp,
            longitudCBCAntes: this.formE1Data.longitudCBCAntes,
            longitudCBCDesp: this.formE1Data.longitudCBCDesp,
            longitudResulDoble: this.formE1Data.longitudResulDoble,
            longDABAntes: this.formE1Data.longDABAntes,
            longDABDesp: this.formE1Data.longDABDesp,
            longDBCAntes: this.formE1Data.longDBCAntes,
            longDBCDesp: this.formE1Data.longDBCDesp,
            longResulSimple: this.formE1Data.longResulSimple,
            longGSABAntes: this.formE1Data.longGSABAntes,
            longGSABDesp: this.formE1Data.longGSABDesp,
            longGSBCAntes: this.formE1Data.longGSBCAntes,
            longGSBCDesp: this.formE1Data.longGSBCDesp,
            longResulSimpleDos: this.formE1Data.longResulSimpleDos,
            longGSATBAntes: this.formE1Data.longGSATBAntes,
            longGSATBDesp: this.formE1Data.longGSATBDesp,
            longGSBTCAntes: this.formE1Data.longGSBTCAntes,
            longGSBTCDesp: this.formE1Data.longGSBTCDesp,
            longResulSimpleTres: this.formE1Data.longResulSimpleTres,
            comentariosMG: this.formE1Data.comentariosMG,
          });
        },
        error: (error) => {
          console.error('Error fetching form E1 data:', error);
        },
      });
  }

  private loadNonConformities(idInforme: number): void {
    this.puertoService
      .getdescripcionPuertoByIdInforme(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Filtra las descripciones que tengan estado N/C o RE
          this.descripcionItems = data.filter(
            (item: any) => item.idStatus === 2 || item.idStatus === 4
          );

          // Añadir las descripciones al formulario
          this.descripcionItems.forEach((item, index) => {
            const controlName = `descripcion_${index}`;
            if (!this.informeForm.get(controlName)) {
              this.informeForm.addControl(
                controlName,
                this.formBuilder.control(item.descripcion, Validators.required)
              );
            }
            this.informeForm.get(controlName)?.disable(); // Deshabilitar por defecto
          });

          // Añadir filas vacías
          this.addDefaultRows();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar las no conformidades:', error);
        },
      });
  }

  private addDefaultRows(): void {
    const minRows = 7;

    // Si el número de descripciones es menor que las filas mínimas (7), añade filas vacías
    if (this.descripcionItems.length < minRows) {
      const remainingRows = minRows - this.descripcionItems.length;
      this.defaultEmptyRows = new Array(remainingRows);
    } else {
      this.defaultEmptyRows = [];
    }
  }

  private loadSetFotografico(idInforme: number) {
    this.puertoService.getSetFotograficoByIdInformePuerto(idInforme).subscribe({
      next: (response) => {
        if (response.success && response.photos.length > 0) {
          this.photos = response.photos;
          this.createPhotoDescriptionsForm(); // Crear el FormGroup una vez que las fotos estén cargadas
        }
      },
      error: (error) => {
        console.error('Error fetching set fotografico:', error);
      },
    });
  }

  // Método para obtener el número más alto de las fotos
  getMaxPhotoNumber(photos: any[]): number {
    if (photos.length === 0) return 0; // Si no hay fotos, empezamos desde 0

    return Math.max(...photos.map((photo) => photo.numero)); // Devolvemos el número más alto
  }

  refreshStatus() {
    if (this.selectedInforme) {
      this.loadItemDetails(this.selectedInforme.idInforme);
    }
  }

  refreshNonConformities() {
    this.loadNonConformities(this.selectedInforme.idInforme);
  }

  getStatusLabel(idStatus: number): string {
    return idStatus === 2 ? 'N/C' : idStatus === 4 ? 'RE' : '';
  }

  // Función para restaurar los valores originales
  restoreOriginalValues() {
    this.itemsWithStatus = this.originalValues.map((item: any) => ({
      ...item,
    }));
  }

  convertBase64ToBlob(base64: string): Blob {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  toggleEdit() {
    if (!this.isAnyEditing) {
      this.isEditing = true;
      this.isAnyEditing = true;
      this.originalValues = this.informeForm.getRawValue();
      this.informeForm.enable();
    } else if (this.isEditing) {
      this.informeForm.patchValue(this.originalValues);
      this.informeForm.disable();
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
      this.originalValues = JSON.parse(JSON.stringify(this.itemsWithStatus));
    } else if (this.isEditingStatusA) {
      this.itemsWithStatus = JSON.parse(JSON.stringify(this.originalValues));
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
    this.isEditingStatusB = !this.isEditingStatusB;

    if (this.isEditingStatusB) {
      this.originalValues = this.itemsWithStatus.map((item) => ({ ...item }));
    } else {
      // Restaura los valores originales si se cancela la edición
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
  }

  toggleEditStatusC() {
    this.isEditingStatusC = !this.isEditingStatusC;

    if (this.isEditingStatusC) {
      this.originalValues = this.itemsWithStatus.map((item) => ({ ...item }));
    } else {
      // Restaura los valores originales si se cancela la edición
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
  }

  toggleEditDescription() {
    if (!this.isAnyEditing) {
      // Iniciar la edición
      this.isEditingFormD = true;
      this.isAnyEditing = true;
      this.descripcionItems.forEach((item, index) => {
        const controlName = `descripcion_${index}`;
        // Habilitar los campos de descripción
        this.informeForm.get(controlName)?.enable();
      });
    } else if (this.isEditingFormD) {
      // Cancelar la edición
      this.isEditingFormD = false;
      this.isAnyEditing = false;
      this.descripcionItems.forEach((item, index) => {
        const controlName = `descripcion_${index}`;
        // Restaurar los valores originales y deshabilitar
        this.informeForm.get(controlName)?.setValue(item.descripcion);
        this.informeForm.get(controlName)?.disable();
      });
    } else {
      this.messageText =
        'Ya estás editando otra sección. Guarda o cancela esa edición primero.';
      this.messageType = 'warning';
      this.showMessage = true;
    }
  }

  toggleEditFormE() {
    if (this.isEditingFormE) {
      // Cancelar la edición, restaurar los valores originales
      this.formE.patchValue(this.originalValues);
    } else {
      // Guardar los valores actuales antes de editar
      this.originalValues = this.formE.getRawValue();
    }
    this.isEditingFormE = !this.isEditingFormE;
  }

  toggleEditFormE1() {
    if (this.isEditingFormE1) {
      // Si se cancela la edición, restaurar los valores originales
      this.formE1.patchValue(this.formE1Data);
    } else {
      // Guardar los valores originales antes de editar
      this.formE1Data = this.formE1.getRawValue();
    }
    this.isEditingFormE1 = !this.isEditingFormE1;
  }

  toggleEditFormF() {
    this.isEditingFormF = !this.isEditingFormF;

    if (this.isEditingFormF) {
      // Guardar los valores actuales antes de comenzar la edición
      this.originalValues = this.informeForm.getRawValue();
      this.informeForm.enable(); // Habilitar el formulario en modo edición
    } else {
      // Si se cancela la edición, restaurar los valores originales
      this.informeForm.patchValue(this.originalValues);
      this.informeForm.disable(); // Deshabilitar el formulario fuera del modo edición
    }
  }

  toggleEditImages() {
  this.isEditingImages = !this.isEditingImages;

  if (this.isEditingImages) {
    // Guardar los valores originales antes de comenzar la edición
    this.originalValues = this.photos.map((photo: any) => ({
      numero: photo.numero,
      descripcionSF: photo.descripcionSF
    }));

    // Habilitar los campos de descripción en el formulario de las fotos
    this.photos.forEach((photo: any) => {
      const controlName = `descripcionSF_${photo.numero}`;
      this.photoDescriptionsForm.get(controlName)?.enable();
    });
  } else {
    // Si se cancela la edición, restaurar los valores originales
    this.photos.forEach((photo: any) => {
      const originalPhoto = this.originalValues.find((orig: any) => orig.numero === photo.numero);
      if (originalPhoto) {
        const controlName = `descripcionSF_${photo.numero}`;
        this.photoDescriptionsForm.get(controlName)?.setValue(originalPhoto.descripcionSF);
      }
    });

    // Deshabilitar los campos de descripción en el formulario de las fotos
    this.photos.forEach((photo: any) => {
      const controlName = `descripcionSF_${photo.numero}`;
      this.photoDescriptionsForm.get(controlName)?.disable();
    });
  }
}

  toggleGanchoPrincipal() {
    if (this.formEData?.ganchoPrincipal > 0) {
      this.showGanchoPrincipal = !this.showGanchoPrincipal;
    }
  }

  toggleGanchoAuxiliar() {
    if (this.formEData?.ganchoAuxiliar > 0) {
      this.showGanchoAuxiliar = !this.showGanchoAuxiliar;
    }
  }

  toggleGanchoAuxiliarE1() {
    this.showGanchoAuxiliarE1 = !this.showGanchoAuxiliarE1;
  }

  toggleGanchoTres() {
    this.showGanchoTres = !this.showGanchoTres;
  }

  saveChanges() {
    if (this.informeForm.valid && this.selectedInforme) {
      // Obtiene todos los datos del formulario
      const informeData = {
        ...this.informeForm.getRawValue(), // Obtiene todos los valores del formulario
        idInforme: this.selectedInforme.idInforme,
        idUser: this.selectedInforme.idUser,
      };

      // Llamada al servicio para guardar los datos
      this.puertoService.editInformePuerto(informeData).subscribe({
        next: (response) => {
          console.log('Datos actualizados exitosamente:', response);
          this.isEditing = false;
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
        },
        error: (error) => {
          console.error('Error al actualizar los datos:', error);
          this.messageText =
            'Error al actualizar los datos. Inténtalo de nuevo.';
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
      this.isSaving = true; // Activa el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      const idInforme = this.selectedInforme.idInforme;
      const numeroInforme = this.selectedInforme.numeroInforme; // Asegúrate de tener el numeroInforme aquí

      // Array para almacenar las descripciones que se enviarán al backend
      const descripciones: {
        descripcion: string;
        idInforme: number;
        idDetalle: number;
        idStatus: number;
      }[] = [];

      const itemsToUpdate = this.itemsWithStatus
        .slice(0, 18)
        .filter((item, index) => {
          const originalItem = this.originalValues[index];

          // Asegurarse de que originalItem existe
          if (!originalItem) {
            console.log(
              `No se encontró el ítem original en la posición ${index}.`
            );
            return false;
          }

          // Verificar si el estado ha cambiado
          const estadoCambiado = item.idStatus !== originalItem.idStatus;

          return estadoCambiado;
        });

      if (itemsToUpdate.length === 0) {
        console.log(
          'No se encontraron ítems modificados para actualizar en la tabla A.'
        );
        this.isSaving = false;
        return;
      }

      const imageUploadPromises: Promise<any>[] = [];
      const itemsData = itemsToUpdate.map((item) => {
        // Guardar las imágenes en memoria para subirlas después
        if (item.imagesNames?.length > 0 && item.images?.length > 0) {
          item.images.forEach((image: string, index: number) => {
            const formData = new FormData();
            const imageName = `${Date.now()}.png`;
            formData.append('idInforme', idInforme.toString());
            formData.append('numeroInforme', numeroInforme);
            formData.append('idDetalle', item.idDetalle.toString());
            formData.append('foto', imageName);
            formData.append('data', this.convertBase64ToBlob(item.images[index]));
            formData.append('numero', (index + 1).toString());
            formData.append('idStatus', item.idStatus.toString());
            formData.append('descripFoto', item.descripFoto[index]);

            const imageUploadPromise = lastValueFrom(
              this.puertoService.sendFotosPuerto(formData)
            );
            imageUploadPromises.push(imageUploadPromise);
          });
        }

        // Guardar las descripciones en el array
        if (item.descripcionNoCumple) {
          descripciones.push({
            descripcion: item.descripcionNoCumple,
            idInforme: idInforme,
            idDetalle: item.idDetalle,
            idStatus: item.idStatus,
          });
        }

        // Construir el objeto de datos del ítem (sin imágenes ni descripciones)
        return {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
        };
      });

      // Subir las imágenes primero
      Promise.all(imageUploadPromises).then(() => {
        // Subir los ítems modificados
        this.puertoService.editItemPuerto(itemsData).subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.isAnyEditing = false;

              // Refrescar los datos
              this.refreshNonConformities();
              this.refreshStatus();

              setTimeout(() => (this.showMessage = false), 3000);
              this.isSaving = false;
              this.isEditingStatusA = false;
              this.isAnyEditing = false;

              if (descripciones.length > 0) {
                this.uploadDescripciones(descripciones);
              }
            } else {
              this.messageText =
                'Error al actualizar los datos. Inténtalo de nuevo.';
              this.messageType = 'error';
              this.refreshStatus();
              this.restoreOriginalValues();
              this.isSaving = false;
              this.isEditingStatusA = false;
              this.isAnyEditing = false;
            }
          },
          error: (error) => {
            console.error('Error al actualizar los datos:', error);
          },
        });
      });
    }
  }

  saveChangesStatusB() {
    if (this.selectedInforme) {
      this.isSaving = true; // Activa el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      const idInforme = this.selectedInforme.idInforme;
      const numeroInforme = this.selectedInforme.numeroInforme; // Asegúrate de tener el numeroInforme aquí

      // Array para almacenar las descripciones que se enviarán al backend
      const descripciones: {
        descripcion: string;
        idInforme: number;
        idDetalle: number;
        idStatus: number;
      }[] = [];

      const itemsToUpdate = this.itemsWithStatus
        .slice(18, 31)
        .filter((item, index) => {
          const globalIndex = 18 + index; // Ajustar el índice global
          const originalItem = this.originalValues[globalIndex];

          // Asegurarse de que originalItem existe
          if (!originalItem) {
            console.log(
              `No se encontró el ítem original en la posición ${index}.`
            );
            return false;
          }

          // Verificar si el estado ha cambiado
          const estadoCambiado = item.idStatus !== originalItem.idStatus;

          return estadoCambiado;
        });

      if (itemsToUpdate.length === 0) {
        console.log(
          'No se encontraron ítems modificados para actualizar en la tabla B.'
        );
        this.isSaving = false;
        return;
      }

      const imageUploadPromises: Promise<any>[] = [];
      const itemsData = itemsToUpdate.map((item) => {
        // Guardar las imágenes en memoria para subirlas después
        if (item.imagesNames?.length > 0 && item.images?.length > 0) {
          item.images.forEach((image: string, index: number) => {
            const formData = new FormData();
            const imageName = `${Date.now()}.png`;
            formData.append('idInforme', idInforme.toString());
            formData.append('numeroInforme', numeroInforme);
            formData.append('idDetalle', item.idDetalle.toString());
            formData.append('foto', imageName);
            formData.append(
              'data',
              this.convertBase64ToBlob(item.images[index])
            );
            formData.append('numero', (index + 1).toString());
            formData.append('idStatus', item.idStatus.toString());

            const imageUploadPromise = lastValueFrom(
              this.puertoService.sendFotosPuerto(formData)
            );
            imageUploadPromises.push(imageUploadPromise);
          });
        }

        // Guardar las descripciones en el array
        if (item.descripcionNoCumple) {
          descripciones.push({
            descripcion: item.descripcionNoCumple,
            idInforme: idInforme,
            idDetalle: item.idDetalle,
            idStatus: item.idStatus,
          });
        }

        // Construir el objeto de datos del ítem (sin imágenes ni descripciones)
        return {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
        };
      });

      // Subir las imágenes primero
      Promise.all(imageUploadPromises).then(() => {
        // Subir los ítems modificados
        this.puertoService.editItemPuerto(itemsData).subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.isAnyEditing = false;

              // Refrescar los datos
              this.refreshNonConformities();
              this.refreshStatus();

              setTimeout(() => (this.showMessage = false), 3000);
              this.isSaving = false;
              this.isEditingStatusB = false;
              this.isAnyEditing = false;

              if (descripciones.length > 0) {
                this.uploadDescripciones(descripciones);
              }
            } else {
              this.messageText =
                'Error al actualizar los datos. Inténtalo de nuevo.';
              this.messageType = 'error';
              this.refreshStatus();
              this.restoreOriginalValues();
              this.isSaving = false;
              this.isEditingStatusB = false;
              this.isAnyEditing = false;
            }
          },
          error: (error) => {
            console.error('Error al actualizar los datos:', error);
          },
        });
      });
    }
  }

  saveChangesStatusC() {
    if (this.selectedInforme) {
      this.isSaving = true; // Activa el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      const idInforme = this.selectedInforme.idInforme;
      const numeroInforme = this.selectedInforme.numeroInforme; // Asegúrate de tener el numeroInforme aquí

      // Array para almacenar las descripciones que se enviarán al backend
      const descripciones: {
        descripcion: string;
        idInforme: number;
        idDetalle: number;
        idStatus: number;
      }[] = [];

      const itemsToUpdate = this.itemsWithStatus
        .slice(31, 51)
        .filter((item, index) => {
          const globalIndex = 31 + index; // Ajustar el índice global
          const originalItem = this.originalValues[globalIndex];

          // Asegurarse de que originalItem existe
          if (!originalItem) {
            console.log(
              `No se encontró el ítem original en la posición ${index}.`
            );
            return false;
          }

          // Verificar si el estado ha cambiado
          const estadoCambiado = item.idStatus !== originalItem.idStatus;

          return estadoCambiado;
        });

      if (itemsToUpdate.length === 0) {
        console.log(
          'No se encontraron ítems modificados para actualizar en la tabla C.'
        );
        this.isSaving = false;
        return;
      }

      const imageUploadPromises: Promise<any>[] = [];
      const itemsData = itemsToUpdate.map((item) => {
        // Guardar las imágenes en memoria para subirlas después
        if (item.imagesNames?.length > 0 && item.images?.length > 0) {
          item.images.forEach((image: string, index: number) => {
            const formData = new FormData();
            const imageName = `${Date.now()}.png`;
            formData.append('idInforme', idInforme.toString());
            formData.append('numeroInforme', numeroInforme);
            formData.append('idDetalle', item.idDetalle.toString());
            formData.append('foto', imageName);
            formData.append(
              'data',
              this.convertBase64ToBlob(item.images[index])
            );
            formData.append('numero', (index + 1).toString());
            formData.append('idStatus', item.idStatus.toString());

            const imageUploadPromise = lastValueFrom(
              this.puertoService.sendFotosPuerto(formData)
            );
            imageUploadPromises.push(imageUploadPromise);
          });
        }

        // Guardar las descripciones en el array
        if (item.descripcionNoCumple) {
          descripciones.push({
            descripcion: item.descripcionNoCumple,
            idInforme: idInforme,
            idDetalle: item.idDetalle,
            idStatus: item.idStatus,
          });
        }

        // Construir el objeto de datos del ítem (sin imágenes ni descripciones)
        return {
          idStatus: item.idStatus,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
        };
      });

      // Subir las imágenes primero
      Promise.all(imageUploadPromises).then(() => {
        // Subir los ítems modificados
        this.puertoService.editItemPuerto(itemsData).subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage = true;
              this.messageText = 'Datos actualizados exitosamente.';
              this.messageType = 'success';
              this.isAnyEditing = false;

              // Refrescar los datos
              this.refreshNonConformities();
              this.refreshStatus();

              setTimeout(() => (this.showMessage = false), 3000);
              this.isSaving = false;
              this.isEditingStatusC = false;
              this.isAnyEditing = false;

              if (descripciones.length > 0) {
                this.uploadDescripciones(descripciones);
              }
            } else {
              this.messageText =
                'Error al actualizar los datos. Inténtalo de nuevo.';
              this.messageType = 'error';
              this.refreshStatus();
              this.restoreOriginalValues();
              this.isSaving = false;
              this.isEditingStatusC = false;
              this.isAnyEditing = false;
            }
          },
          error: (error) => {
            console.error('Error al actualizar los datos:', error);
          },
        });
      });
    }
  }

  saveChangesDescription() {
    if (this.selectedInforme) {
      this.isSaving = true; // Activar el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      const descripcionesToUpdate = this.descripcionItems
        .map((item, index) => {
          const descripcionNueva = this.informeForm.get(
            `descripcion_${index}`
          )?.value;
          if (descripcionNueva !== item.descripcion) {
            return {
              descripcion: descripcionNueva,
              idInforme: this.selectedInforme.idInforme,
              idDetalle: item.idDetalle,
            };
          }
          return null;
        })
        .filter((item) => item !== null); // Filtrar las descripciones que no han cambiado

      if (descripcionesToUpdate.length === 0) {
        console.log(
          'No se encontraron descripciones modificadas para actualizar.'
        );
        this.isSaving = false;
        this.isEditingFormD = false;
        return;
      }

      let success = true;
      descripcionesToUpdate.forEach((descripcionData, index) => {
        this.puertoService.editDescripcionPuerto(descripcionData).subscribe({
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
            if (index === descripcionesToUpdate.length - 1) {
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
              this.isEditingFormD = false;
              setTimeout(() => (this.showMessage = false), 3000);
            }
          },
        });
      });
    }
  }

  saveFormEChanges() {
    if (this.formE.valid && this.selectedInforme?.idInforme) {
      this.isSaving = true; // Activar el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      // Obtener todos los valores actuales del formulario
      const formValues = this.formE.getRawValue();

      // Asegurarse de incluir el idInforme
      formValues['idInforme'] = this.selectedInforme.idInforme;

      // Enviar los datos al backend
      this.puertoService.editFormEPuerto(formValues).subscribe({
        next: (response) => {
          console.log('Formulario actualizado:', response);
          this.isEditingFormE = false;

          // Recargar los datos del formulario desde el servidor
          this.loadFormE(this.selectedInforme.idInforme);

          // Mostrar mensaje de éxito
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => {
            this.showMessage = false;
          }, 3000);
        },
        error: (error) => {
          console.error('Error al guardar:', error);

          // Mostrar mensaje de error
          this.messageText = 'Error al guardar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        },
        complete: () => {
          this.isSaving = false; // Desactivar el spinner
        },
      });
    } else {
      alert('Por favor complete los campos requeridos.');
    }
  }

  saveFormE1Changes() {
    if (this.formE1.valid && this.selectedInforme?.idInforme) {
      this.isSaving = true; // Activar el spinner
      this.savingMessage = 'Guardando cambios, por favor espere...';

      const updatedData = {
        ...this.formE1.getRawValue(), // Obtener todos los valores del formulario E1
        idInforme: this.selectedInforme.idInforme, // Añadir ID del informe
      };

      // Reemplazar los campos vacíos por 0 antes de enviarlos al backend
      Object.keys(updatedData).forEach((key) => {
        if (updatedData[key] === '' || updatedData[key] === null) {
          updatedData[key] = 0; // Reemplazar los valores vacíos con 0
        }
      });

      // Llamada al servicio para guardar los datos
      this.puertoService.editFormE1Puerto(updatedData).subscribe({
        next: (response) => {
          console.log('Formulario E1 actualizado exitosamente:', response);

          // Actualizar los valores en el formulario después de guardar
          this.formE1.patchValue({
            comentarios: updatedData.comentarios,
            ganchoAntes: updatedData.ganchoAntes,
            ganchoDespues: updatedData.ganchoDespues,
            ganchoHInicio: updatedData.ganchoHInicio,
            ganchoHTermino: updatedData.ganchoHTermino,
            ganchoResultado: updatedData.ganchoResultado,
            ganchoAuxAntes: updatedData.ganchoAuxAntes,
            ganchoAuxDespues: updatedData.ganchoAuxDespues,
            ganchoAuxHInicio: updatedData.ganchoAuxHInicio,
            ganchoAuxHTermino: updatedData.ganchoAuxHTermino,
            ganchoAuxResultado: updatedData.ganchoAuxResultado,
          });
          this.loadFormE1(this.selectedInforme.idInforme);

          // Actualizar la variable de visualización de comentarios
          this.formE1Data.comentarios = updatedData.comentarios;

          // Mostrar mensaje de éxito
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);

          this.isEditingFormE1 = false;
        },
        error: (error) => {
          console.error('Error al actualizar el formulario E1:', error);
          this.messageText =
            'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        },
        complete: () => {
          this.isSaving = false; // Desactivar el spinner
        },
      });
    } else {
      alert('Por favor completa todos los campos antes de guardar.');
    }
  }

  saveFormFChanges() {
    if (this.informeForm.get('idResul')?.valid) {
      const currentFormData = this.informeForm.getRawValue();

      const formIData = {
        ...currentFormData,
        idResul: this.informeForm.get('idResul')?.value,
        idInforme: this.selectedInforme.idInforme,
      };

      // Llamada al servicio para actualizar solo el idResul sin modificar otros campos
      this.puertoService.editInformePuerto(formIData).subscribe({
        next: (response) => {
          console.log('idResul actualizado exitosamente', response);
          this.isEditingFormF = false;
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
          this.selectedInforme.idResul = formIData.idResul;
        },
        error: (error) => {
          console.error('Error al actualizar el idResul', error);
          this.messageText =
            'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        },
      });
    } else {
      alert('Por favor completa todos los campos antes de guardar.');
    }
  }

  // Guardar cambios de edición (como los comentarios)
  saveImageChanges() {
  // Iterar sobre las fotos actuales
  this.photos.forEach((photo: any) => {
    const controlName = `descripcionSF_${photo.numero}`;
    const currentDescription = this.photoDescriptionsForm.get(controlName)?.value;

    // Solo actualiza si la descripción ha cambiado
    if (currentDescription !== photo.descripcionSF) {
      const updatedPhotoData = {
        idInforme: this.selectedInforme.idInforme,
        numeroInforme: this.selectedInforme.numeroInforme,
        descripcionSF: currentDescription,
        numero: photo.numero,
      };

      // Hacer la petición para actualizar solo si hay cambios
      this.puertoService.editSetFotograficoPuerto(updatedPhotoData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              // Actualizar la descripción en el objeto photo
              photo.descripcionSF = currentDescription;
              console.log(`Descripción actualizada para la imagen número: ${photo.numero}`);
            }
          },
          error: (error) => {
            console.error('Error al actualizar la descripción:', error);
          }
        });
    }
  });

  // Finalizar el modo de edición
  this.isEditingImages = false;
}

  openModal(item: any, allowImages: boolean): void {
    const idInforme = this.selectedInforme?.idInforme;
    const numeroInforme = this.informeForm.get('numeroInforme')?.value;
    const idDetalle = item.idDetalle;
    const idStatus = item.idStatus;

    if (!idInforme || !numeroInforme || !idDetalle || !idStatus) {
      console.error('Datos faltantes al intentar abrir el modal.');
      return;
    }

    this.originalStatus = { ...item };

    this.selecInforme = idInforme;
    this.selecNumInforme = numeroInforme;
    this.selecDetalle = idDetalle;
    this.selecStatus = idStatus;
    this.allowImages = allowImages;

    this.showModal = true;
    this.currentItemIndex = this.itemsWithStatus.indexOf(item);

    console.log('Modal abierto con los siguientes datos:');
    console.log('idInforme:', idInforme);
    console.log('numeroInforme:', numeroInforme);
    console.log('idDetalle:', idDetalle);
    console.log('idStatus:', idStatus);
    console.log('allowImages:', allowImages);

    // Aquí pasamos el servicio al modal
    this.modalInstance = {
      idInforme: idInforme,
      idDetalle: idDetalle,
      idStatus: idStatus,
      numeroInforme: numeroInforme,
      allowImages: allowImages,
      uploadImageService: this.puertoService.sendFotosPuerto.bind(
        this.puertoService
      ), // Servicio de subida
    };
  }

  closeModal(modalData: {
    description: string;
    descripFoto: string[];
    images: string[];
    imagesNames: string[];
  }): void {
    if (this.currentItemIndex !== null) {
      const currentItem = this.itemsWithStatus[this.currentItemIndex];
      currentItem.descripcionNoCumple = modalData.description;

      // Si allowImages es true, manejar las imágenes, de lo contrario, ignorarlas
      if (this.allowImages) {
        currentItem.images = [...modalData.images];
        currentItem.imagesNames = modalData.images.map(
          (index) => `${Date.now()}.png`
        );
        currentItem.descripFoto = [...modalData.descripFoto];

        // Verificar que no se estén duplicando imágenes antes de subir
        if (
          currentItem.images.length > 0 &&
          currentItem.imagesNames.length === currentItem.images.length &&
          currentItem.descripFoto.length === currentItem.images.length
        ) {
          console.log('Imágenes almacenadas en el item:', currentItem.images);
          console.log(
            'Nombres de imágenes almacenados en el item:',
            currentItem.imagesNames
          );
          console.log(
          'Descripciones de imágenes almacenadas en el item:',
          currentItem.descripFoto
        );
        } else {
          console.error(
            'Error: Las imágenes y los nombres de las imágenes no coinciden.'
          );
        }
      }

      // Cerrar el modal y restablecer el índice actual
      this.showModal = false;
      this.currentItemIndex = null;
      this.cdr.detectChanges(); // Forzar la actualización visual
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

  private uploadDescripciones(descripciones: any[]) {
    // Enviar el array de descripciones al backend
    this.puertoService.postDescripcionPuerto({ descripciones }).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Descripciones subidas exitosamente.');
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          this.isAnyEditing = false;

          //this.refreshNonConformities();
          this.refreshStatus();

          setTimeout(() => (this.showMessage = false), 3000);
          this.isSaving = false;
          this.isAnyEditing = false;
        } else {
          console.error('Error al subir las descripciones:', response.message);
          this.handleSaveError();
        }
      },
      error: (error) => {
        console.error('Error al subir las descripciones:', error);
        this.handleSaveError();
      },
    });
  }

  private handleSaveError(error?: any) {
    this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
    this.messageType = 'error';
    console.error('Error al actualizar los datos:', error);
    this.refreshStatus();
    this.restoreOriginalValues();
    this.isSaving = false;
    this.isAnyEditing = false;
  }

  showWarningMessage(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.messageText = message;
      this.messageType = 'warning';
      this.showMessage = true; // Mostrar el modal

      // Configurar las funciones de aceptación y cancelación para el mensaje
      this.onAccept = () => {
        resolve(true); // Confirmar la acción
        this.showMessage = false; // Ocultar el modal
      };

      this.onCancel = () => {
        resolve(false); // Cancelar la acción
        this.showMessage = false; // Ocultar el modal
      };
    });
  }

  uploadSetFotograficoService(formData: FormData) {
  return this.puertoService.sendSetFotograficoPuerto(formData);
}

openSetFotograficoModal() {
  this.puertoService.getSetFotograficoByIdInformePuerto(this.selectedInforme.idInforme).subscribe({
    next: (response) => {
      if (response.success && response.photos.length > 0) {
        // Cargar las imágenes existentes
        this.photos = response.photos;

        // Obtener el número más alto entre las fotos existentes
        const existingMaxPhotoNumber = Math.max(...this.photos.map((photo: any) => photo.numero), 0);
        
        // Asignar el valor más alto al `maxPhotoNumber`
        this.maxPhotoNumber = existingMaxPhotoNumber;
      } else {
        // Si no hay fotos, inicializamos `photos` y `maxPhotoNumber`
        this.photos = [];
        this.maxPhotoNumber = 0;
      }

      // Abrir el modal y permitir la subida de nuevas imágenes
      this.modalInstance = {
        idInforme: this.selectedInforme.idInforme,
        numeroInforme: this.selectedInforme.numeroInforme,
        maxPhotoNumber: this.maxPhotoNumber,
        allowImages: true,
        uploadImageService: this.uploadSetFotograficoService.bind(this),
      };
      this.showSetFotograficoModal = true;
    },
    error: (error) => {
      console.error('Error al cargar el set fotográfico:', error);

      if (error.status === 500 && error.error?.message.includes('No se encontraron fotos')) {
        // Si el error es que no hay fotos, lo manejamos como un caso válido
        console.log('No se encontraron fotos, se permite subir nuevas.');

        // Inicializar `photos` y `maxPhotoNumber`
        this.photos = [];
        this.maxPhotoNumber = 0;

        // Abrir el modal y permitir la subida de nuevas imágenes
        this.modalInstance = {
          idInforme: this.selectedInforme.idInforme,
          numeroInforme: this.selectedInforme.numeroInforme,
          maxPhotoNumber: this.maxPhotoNumber,
          allowImages: true,
          uploadImageService: this.uploadSetFotograficoService.bind(this),
        };
        this.showSetFotograficoModal = true;
      } else {
        // Manejar otros errores
        console.error('Error desconocido al cargar el set fotográfico.');
        alert('Error al cargar el set fotográfico. Por favor, inténtalo de nuevo.');
      }
    }
  });
}

  async onSaveSetFotografico(event: { descripcionSF: string[]; images: Blob[]; imageNames: string[]; }) {
  if (event.images.length > 0) {
    this.isSaving = true;
    this.savingMessage = 'Subiendo imágenes, por favor espere...';

    let uploadCount = 0;

    try {
      for (let index = 0; index < event.images.length; index++) {
        const image = event.images[index];
        const formData = new FormData();
        formData.append('idInforme', this.selectedInforme.idInforme.toString());
        formData.append('numeroInforme', this.selectedInforme.numeroInforme);
        const newPhotoNumber = this.maxPhotoNumber + 1;
        this.maxPhotoNumber = newPhotoNumber;

        formData.append('descripcionSF', event.descripcionSF[index]);
        formData.append('data', image);
        formData.append('foto', event.imageNames[index]);
        formData.append('numero', newPhotoNumber.toString());

        const response = await this.uploadSetFotograficoService(formData).pipe(takeUntil(this.destroy$)).toPromise();
        uploadCount++;

        if (uploadCount === event.images.length) {
          // Eliminar la imagen eliminada anteriormente si la subida es exitosa
          if (this.deletedPhoto) {
            const fotoData = {
              idInforme: this.selectedInforme.idInforme,
              numeroInforme: this.selectedInforme.numeroInforme,
              foto: this.deletedPhoto.foto,
              numero: this.deletedPhoto.numero,
            };
            await lastValueFrom(this.puertoService.deleteFotoSetFotograficoPuerto(fotoData));

            // Eliminar visualmente la foto y la descripción
            this.photos = this.photos.filter((photo: any) => photo.numero !== this.deletedPhoto.numero);

            // Eliminar el control del formulario
            const controlName = `descripcionSF_${this.deletedPhoto.numero}`;
            if (this.photoDescriptionsForm.contains(controlName)) {
              this.photoDescriptionsForm.removeControl(controlName); // Eliminar el control del formulario
            }

            this.deletedPhoto = null; // Limpiar la imagen eliminada temporal
          }

          this.showMessage = true;
          this.messageText = 'Imágenes subidas exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
          this.showSetFotograficoModal = false;
          this.isSaving = false;

          // Recargar el set fotográfico después de la subida
          this.loadSetFotografico(this.selectedInforme.idInforme);
        }
      }
    } catch (error) {
      console.error('Error al subir las imágenes:', error);
      this.messageText = 'Error al subir las imágenes. Inténtalo de nuevo.';
      this.messageType = 'error';
      this.showMessage = true;
      this.isSaving = false;
    }
  } else {
    alert('No hay imágenes para subir.');
  }
}

  onCancelSetFotografico() {
  if (this.deletedPhoto) {
    // Restaurar la imagen eliminada si el modal es cancelado
    const exists = this.photos.some((photo: any) => photo.numero === this.deletedPhoto.numero);
    
    if (!exists) {
      this.photos.push(this.deletedPhoto);  // Restauramos solo si no está
    }

    // Habilitar el control asociado en el formulario
    const controlName = `descripcionSF_${this.deletedPhoto.numero}`;
    if (this.photoDescriptionsForm.contains(controlName)) {
      this.photoDescriptionsForm.get(controlName)?.enable();  // Habilitamos el control nuevamente
    }

    this.deletedPhoto = null;  // Limpiar la imagen eliminada temporalmente

    // Forzar la actualización de la lista de fotos y del formulario
    this.cdr.detectChanges();
  }

  // Cerrar el modal
  this.showSetFotograficoModal = false;

  // Refrescar la vista por completo para evitar cualquier duplicación visual
  setTimeout(() => {
    this.loadSetFotografico(this.selectedInforme.idInforme);
  }, 0);
}

async confirmDeletePhoto(photo: any) {
  const confirmDelete = await this.showWarningMessage('¿Estás seguro de que deseas eliminar esta imagen?');

  if (confirmDelete) {
    // Almacenar temporalmente la imagen que se intenta eliminar
    this.deletedPhoto = { ...photo };

    // Condición 1: Si hay más de 6 imágenes, eliminar del backend inmediatamente
    if (this.photos.length > 6) {
      // Remover visualmente la imagen
      this.photos = this.photos.filter((p: any) => p.foto !== photo.foto);

      // Deshabilitar el control en lugar de eliminarlo
      const controlName = `descripcionSF_${photo.numero}`;
      if (this.photoDescriptionsForm.contains(controlName)) {
        this.photoDescriptionsForm.get(controlName)?.disable();
      }

      // Eliminar la imagen del backend inmediatamente
      const fotoData = {
        idInforme: this.selectedInforme.idInforme,
        numeroInforme: this.selectedInforme.numeroInforme,
        foto: photo.foto,
        numero: photo.numero,
      };

      try {
        await lastValueFrom(this.puertoService.deleteFotoSetFotograficoPuerto(fotoData));
        console.log(`Foto eliminada exitosamente del backend: ${photo.foto}`);
      } catch (error) {
        console.error('Error al eliminar la foto del backend:', error);
        this.messageText = 'Error al eliminar la imagen del servidor.';
        this.messageType = 'error';
        this.showMessage = true;
        setTimeout(() => (this.showMessage = false), 3000);
      }

      // Preguntar si desea reemplazar la imagen
      const confirmReplace = await this.showWarningMessage('¿Deseas reemplazar la imagen eliminada con una nueva?');

      if (confirmReplace) {
        this.openSetFotograficoModal(); // Abrir modal para reemplazar la imagen
      } else {
        console.log('Imagen eliminada sin reemplazo.');
      }
    }

    // Condición 2: Si hay exactamente 6 imágenes
    else if (this.photos.length === 6) {
      // Abrir el modal para reemplazar la imagen
      this.openSetFotograficoModal();

      // Esperar la respuesta del modal
      const confirmReplace = await this.showWarningMessage('¿Deseas reemplazar la imagen eliminada con una nueva?');

      if (confirmReplace) {
        // Si se sube una nueva imagen, eliminar la anterior del backend
        const fotoData = {
          idInforme: this.selectedInforme.idInforme,
          numeroInforme: this.selectedInforme.numeroInforme,
          foto: photo.foto,
          numero: photo.numero,
        };

        try {
          await lastValueFrom(this.puertoService.deleteFotoSetFotograficoPuerto(fotoData));
          console.log(`Foto eliminada exitosamente del backend: ${photo.foto}`);
        } catch (error) {
          console.error('Error al eliminar la foto del backend:', error);
          this.messageText = 'Error al eliminar la imagen del servidor.';
          this.messageType = 'error';
          this.showMessage = true;
          setTimeout(() => (this.showMessage = false), 3000);
        }
      } else {
        // Si el usuario cancela el modal, restaurar la imagen visualmente
        this.restoreDeletedPhoto();
      }
    }
  }
}

restoreDeletedPhoto() {
  // Restaurar la imagen eliminada en la vista
  this.photos.push(this.deletedPhoto);

  // Habilitar el control asociado en el formulario nuevamente
  const controlName = `descripcionSF_${this.deletedPhoto.numero}`;
  if (this.photoDescriptionsForm.contains(controlName)) {
    this.photoDescriptionsForm.get(controlName)?.enable();
  }

  // Limpiar la imagen eliminada temporalmente
  this.deletedPhoto = null;

  // Forzar la actualización de la vista
  this.cdr.detectChanges();

  // Limpiar el estado para asegurar futuras eliminaciones
  this.resetState();
}

resetState() {
  this.deletedPhoto = null;
  // Asegúrate de reiniciar cualquier otro estado que esté afectando el flujo
  this.cdr.detectChanges(); // Actualiza la vista para reflejar el cambio
}



}
