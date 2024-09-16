import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { TelescopicaService } from './services/telescopica.service';
import { PdfService } from '../../services/pdf.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import html2canvas from 'html2canvas';
import { InfoMessageComponent } from '../components/info-message/info-message.component';

@Component({
  selector: 'app-form-telescopica',
  templateUrl: './form-telescopica.component.html',
  styleUrl: './form-telescopica.component.scss',
})
export class FormTelescopicaComponent implements OnInit, OnDestroy {
  informes: any[] = [];
  itemsWithStatus: any[] = [];
  itemsWithDetail: any[] = [];
  tituloForm: any[] = [];
  descripcionItems: any[] = [];
  nonConformities: any[] = [];
  uploadedImageNames: string[] = [];
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
  isEditingDescription = false;
  isCloseModal = false;
  messageText = '';
  savingMessage = '';
  messageType: 'success' | 'error' | 'warning' = 'success';
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
  defaultEmptyRows = new Array(7);
  selectedItem: any = null;
  modalInstance: any = null;
  onAccept: () => void = () => {};
  onCancel: () => void = () => {};
  private destroy$ = new Subject<void>();

  constructor(
    private telescopicaService: TelescopicaService,
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
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
      nombreRutInspector: ['', Validators.required],
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
    this.messageType = 'success'; // O el estado por defecto que prefieras
    this.showMessage = false;
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
    const previousStatus = item.idStatus;  // Guardamos el estado anterior
    const previousAlias = item.alias;      // Guardamos el alias anterior

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
          this.cdr.detectChanges();  // Forzar la actualización visual
        }
      });
    } else {
      // Si no es necesario confirmar, aplicar el cambio directamente
      this.handleStatusChange(item, selectedIdStatus, previousStatus);
    }
  }
}

handleStatusChange(item: any, selectedIdStatus: string, previousStatus: number): void {
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
    const descripcionData = { idInforme, idDetalle, idStatus: originalStatus };
    const descripcionResponse = await lastValueFrom(
      this.telescopicaService.deleteDescripcionTelescopica(descripcionData)
    );

    if (descripcionResponse.success) {
      console.log('Descripción eliminada exitosamente.');
    } else {
      console.error('Error al eliminar la descripción:', descripcionResponse.message);
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
      this.telescopicaService.getFotoByIdInformeTelescopica(idInforme)
    );

    if (fotosResponse && fotosResponse.photos) {
      const fotosFiltradas = fotosResponse.photos.filter((foto: any) => foto.idDetalle === idDetalle);

      if (fotosFiltradas.length > 0) {
        for (const foto of fotosFiltradas) {
          const fotoData = {
            idInforme: idInforme,
            idDetalle: idDetalle,
            numeroInforme: numeroInforme
          };
          await lastValueFrom(this.telescopicaService.deleteFotoTelescopicasByIdDetalle(fotoData));
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

  private loadNonConformities(idInforme: number): void {
    this.telescopicaService
      .getdescripcionTelescopicaByIdInforme(idInforme)
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

  private loadFormH(idInforme: number) {
    this.telescopicaService
      .getformHTelescopicaByIdInforme(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.formHData = data[0];
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

   private addNotMetDescription(descriptionData: any): void {
    this.telescopicaService
      .postDescripcionTelescopica(descriptionData)
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
      this.originalValues = this.itemsWithStatus.map((item) => ({ ...item }));
    } else {
      // Restaura los valores originales si se cancela la edición
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
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

  toggleEditStatusD() {
    this.isEditingStatusD = !this.isEditingStatusD;

    if (this.isEditingStatusD) {
      this.originalValues = this.itemsWithStatus.map((item) => ({ ...item }));
    } else {
      // Restaura los valores originales si se cancela la edición
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
  }

  toggleEditStatusE() {
    this.isEditingStatusE = !this.isEditingStatusE;

    if (this.isEditingStatusE) {
      this.originalValues = this.itemsWithStatus.map((item) => ({ ...item }));
    } else {
      // Restaura los valores originales si se cancela la edición
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
  }

  toggleEditStatusF() {
    this.isEditingStatusF = !this.isEditingStatusF;

    if (this.isEditingStatusF) {
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
      this.isEditingFormG = true;
      this.isAnyEditing = true;
      this.descripcionItems.forEach((item, index) => {
        const controlName = `descripcion_${index}`;
        // Habilitar los campos de descripción
        this.informeForm.get(controlName)?.enable();
      });
    } else if (this.isEditingFormG) {
      // Cancelar la edición
      this.isEditingFormG = false;
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

  toggleEditFormH() {
    if (this.isEditingFormH) {
      // Cancelar la edición, restaurar los valores originales
      this.formH.patchValue(this.originalValues);
    } else {
      // Guardar los valores actuales antes de editar
      this.originalValues = this.formH.getRawValue();
    }
    this.isEditingFormH = !this.isEditingFormH;
  }

  toggleEditFormH1() {
    if (this.isEditingFormH1) {
      // Si se cancela la edición, restaurar los valores originales
      this.formH1.patchValue(this.formH1Data);
    } else {
      // Guardar los valores originales antes de editar
      this.formH1Data = this.formH1.getRawValue();
    }
    this.isEditingFormH1 = !this.isEditingFormH1;
  }

  toggleEditFormH2() {
    if (this.isEditingFormH2) {
      // Si se cancela la edición, restaurar los valores originales
      this.formH2.patchValue(this.formH2Data);
    } else {
      // Guardar los valores originales antes de editar
      this.formH2Data = this.formH2.getRawValue();
    }
    this.isEditingFormH2 = !this.isEditingFormH2;
  }

  toggleEditFormI() {
    this.isEditingFormI = !this.isEditingFormI;

    if (this.isEditingFormI) {
      // Guardar los valores actuales antes de comenzar la edición
      this.originalValues = this.informeForm.getRawValue();
      this.informeForm.enable(); // Habilitar el formulario en modo edición
    } else {
      // Si se cancela la edición, restaurar los valores originales
      this.informeForm.patchValue(this.originalValues);
      this.informeForm.disable(); // Deshabilitar el formulario fuera del modo edición
    }
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

  saveChanges() {
    if (this.informeForm.valid && this.selectedInforme) {
      // Obtiene todos los datos del formulario
      const informeData = {
        ...this.informeForm.getRawValue(), // Obtiene todos los valores del formulario
        idInforme: this.selectedInforme.idInforme,
        idUser: this.selectedInforme.idUser,
      };

      // Llamada al servicio para guardar los datos
      this.telescopicaService.editInformeTelescopicas(informeData).subscribe({
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
    const descripciones: { descripcion: string; idInforme: number; idDetalle: number; idStatus: number }[] = [];

    const itemsToUpdate = this.itemsWithStatus
      .slice(0, 9)
      .filter((item, index) => {
        const originalItem = this.originalValues[index];

        // Asegurarse de que originalItem existe
        if (!originalItem) {
          console.log(`No se encontró el ítem original en la posición ${index}.`);
          return false;
        }

        // Verificar si el estado ha cambiado
        const estadoCambiado = item.idStatus !== originalItem.idStatus;

        return estadoCambiado;
      });

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems modificados para actualizar en la tabla A.');
      this.isSaving = false;
      return;
    }

    const imageUploadPromises: Promise<any>[] = [];
    const itemsData = itemsToUpdate.map((item) => {
      // Guardar las imágenes en memoria para subirlas después
      if (item.imagesNames?.length > 0 && item.images?.length > 0) {
        item.images.forEach((image: string, index: number) => {
          const formData = new FormData();
          formData.append('idInforme', idInforme.toString());
          formData.append('numeroInforme', numeroInforme);  // Añadir numeroInforme al FormData
          formData.append('idDetalle', item.idDetalle.toString());
          formData.append('foto', item.imagesNames[index]);
          formData.append('data', this.convertBase64ToBlob(item.images[index]));
          formData.append('numero', (index + 1).toString()); // Número de imagen
          formData.append('idStatus', item.idStatus.toString());

          const imageUploadPromise = lastValueFrom(this.telescopicaService.sendFotosTelescopica(formData));
          imageUploadPromises.push(imageUploadPromise);
        });
      }

      // Guardar las descripciones en el array
      if (item.descripcionNoCumple) {
        descripciones.push({
          descripcion: item.descripcionNoCumple,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
          idStatus: item.idStatus
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
      this.telescopicaService.editItemTelescopica(itemsData).subscribe({
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
            this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
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
    const descripciones: { descripcion: string; idInforme: number; idDetalle: number; idStatus: number }[] = [];

    // Ajustar los índices para la tabla B (del 10 al 24, índice 9 al 23)
    const itemsToUpdate = this.itemsWithStatus
      .slice(9, 24)
      .filter((item, index) => {
        const globalIndex = 9 + index; // Ajustar el índice global
        const originalItem = this.originalValues[globalIndex];

        // Asegurarse de que originalItem existe
        if (!originalItem) {
          console.log(`No se encontró el ítem original en la posición ${globalIndex}.`);
          return false;
        }

        // Verificar si el estado ha cambiado
        const estadoCambiado = item.idStatus !== originalItem.idStatus;

        return estadoCambiado;
      });

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems modificados para actualizar en la tabla B.');
      this.isSaving = false;
      return;
    }

    const imageUploadPromises: Promise<any>[] = [];
    const itemsData = itemsToUpdate.map((item) => {
      // Guardar las imágenes en memoria para subirlas después
      if (item.imagesNames?.length > 0 && item.images?.length > 0) {
        item.images.forEach((image: string, index: number) => {
          const formData = new FormData();
          formData.append('idInforme', idInforme.toString());
          formData.append('numeroInforme', numeroInforme);  // Añadir numeroInforme al FormData
          formData.append('idDetalle', item.idDetalle.toString());
          formData.append('foto', item.imagesNames[index]);
          formData.append('data', this.convertBase64ToBlob(item.images[index]));
          formData.append('numero', (index + 1).toString()); // Número de imagen
          formData.append('idStatus', item.idStatus.toString());

          const imageUploadPromise = lastValueFrom(this.telescopicaService.sendFotosTelescopica(formData));
          imageUploadPromises.push(imageUploadPromise);
        });
      }

      // Guardar las descripciones en el array
      if (item.descripcionNoCumple) {
        descripciones.push({
          descripcion: item.descripcionNoCumple,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
          idStatus: item.idStatus
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
      this.telescopicaService.editItemTelescopica(itemsData).subscribe({
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
            this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
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
    const descripciones: { descripcion: string; idInforme: number; idDetalle: number; idStatus: number }[] = [];

    // Ajustar los índices para la tabla C (del 25 al 34, índice 24 al 33)
    const itemsToUpdate = this.itemsWithStatus
      .slice(24, 34)
      .filter((item, index) => {
        const globalIndex = 24 + index; // Ajustar el índice global
        const originalItem = this.originalValues[globalIndex];

        // Asegurarse de que originalItem existe
        if (!originalItem) {
          console.log(`No se encontró el ítem original en la posición ${globalIndex}.`);
          return false;
        }

        // Verificar si el estado ha cambiado
        const estadoCambiado = item.idStatus !== originalItem.idStatus;

        return estadoCambiado;
      });

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems modificados para actualizar en la tabla C.');
      this.isSaving = false;
      return;
    }

    const imageUploadPromises: Promise<any>[] = [];
    const itemsData = itemsToUpdate.map((item) => {
      // Guardar las imágenes en memoria para subirlas después
      if (item.imagesNames?.length > 0 && item.images?.length > 0) {
        item.images.forEach((image: string, index: number) => {
          const formData = new FormData();
          formData.append('idInforme', idInforme.toString());
          formData.append('numeroInforme', numeroInforme);  // Añadir numeroInforme al FormData
          formData.append('idDetalle', item.idDetalle.toString());
          formData.append('foto', item.imagesNames[index]);
          formData.append('data', this.convertBase64ToBlob(item.images[index]));
          formData.append('numero', (index + 1).toString()); // Número de imagen
          formData.append('idStatus', item.idStatus.toString());

          const imageUploadPromise = lastValueFrom(this.telescopicaService.sendFotosTelescopica(formData));
          imageUploadPromises.push(imageUploadPromise);
        });
      }

      // Guardar las descripciones en el array
      if (item.descripcionNoCumple) {
        descripciones.push({
          descripcion: item.descripcionNoCumple,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
          idStatus: item.idStatus
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
      this.telescopicaService.editItemTelescopica(itemsData).subscribe({
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
            this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
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

  saveChangesStatusD() {
  if (this.selectedInforme) {
    this.isSaving = true; // Activa el spinner
    this.savingMessage = 'Guardando cambios, por favor espere...';

    const idInforme = this.selectedInforme.idInforme;
    const numeroInforme = this.selectedInforme.numeroInforme; // Asegúrate de tener el numeroInforme aquí

    // Array para almacenar las descripciones que se enviarán al backend
    const descripciones: { descripcion: string; idInforme: number; idDetalle: number; idStatus: number }[] = [];

    // Ajustar los índices para los ítems del 35 al 47 (índice 34 al 46)
    const itemsToUpdate = this.itemsWithStatus
      .slice(34, 47)
      .filter((item, index) => {
        const globalIndex = 34 + index; // Ajustar el índice global
        const originalItem = this.originalValues[globalIndex];

        // Asegurarse de que originalItem existe
        if (!originalItem) {
          console.log(`No se encontró el ítem original en la posición ${globalIndex}.`);
          return false;
        }

        // Verificar si el estado ha cambiado
        const estadoCambiado = item.idStatus !== originalItem.idStatus;

        return estadoCambiado;
      });

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems modificados para actualizar en la tabla D.');
      this.isSaving = false;
      return;
    }

    const imageUploadPromises: Promise<any>[] = [];
    const itemsData = itemsToUpdate.map((item) => {
      // Guardar las imágenes en memoria para subirlas después
      if (item.imagesNames?.length > 0 && item.images?.length > 0) {
        item.images.forEach((image: string, index: number) => {
          const formData = new FormData();
          formData.append('idInforme', idInforme.toString());
          formData.append('numeroInforme', numeroInforme);  // Añadir numeroInforme al FormData
          formData.append('idDetalle', item.idDetalle.toString());
          formData.append('foto', item.imagesNames[index]);
          formData.append('data', this.convertBase64ToBlob(item.images[index]));
          formData.append('numero', (index + 1).toString()); // Número de imagen
          formData.append('idStatus', item.idStatus.toString());

          const imageUploadPromise = lastValueFrom(this.telescopicaService.sendFotosTelescopica(formData));
          imageUploadPromises.push(imageUploadPromise);
        });
      }

      // Guardar las descripciones en el array
      if (item.descripcionNoCumple) {
        descripciones.push({
          descripcion: item.descripcionNoCumple,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
          idStatus: item.idStatus
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
      this.telescopicaService.editItemTelescopica(itemsData).subscribe({
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
            this.isEditingStatusD = false;
            this.isAnyEditing = false;

            if (descripciones.length > 0) {
              this.uploadDescripciones(descripciones);
            }

          } else {
            this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
            this.messageType = 'error';           
            this.refreshStatus();
            this.restoreOriginalValues();
            this.isSaving = false;
            this.isEditingStatusD = false;
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

  saveChangesStatusE() {
  if (this.selectedInforme) {
    this.isSaving = true; // Activa el spinner
    this.savingMessage = 'Guardando cambios, por favor espere...';

    const idInforme = this.selectedInforme.idInforme;
    const numeroInforme = this.selectedInforme.numeroInforme; // Asegúrate de tener el numeroInforme aquí

    // Array para almacenar las descripciones que se enviarán al backend
    const descripciones: { descripcion: string; idInforme: number; idDetalle: number; idStatus: number }[] = [];

    // Ajustar los índices para los ítems del 48 al 58 (índice 47 al 57)
    const itemsToUpdate = this.itemsWithStatus
      .slice(47, 58)
      .filter((item, index) => {
        const globalIndex = 47 + index; // Ajustar el índice global para comparación
        const originalItem = this.originalValues[globalIndex];

        // Asegurarse de que originalItem existe
        if (!originalItem) {
          console.log(`No se encontró el ítem original en la posición ${globalIndex}.`);
          return false;
        }

        // Verificar si el estado ha cambiado
        const estadoCambiado = item.idStatus !== originalItem.idStatus;

        return estadoCambiado;
      });

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems modificados para actualizar en la tabla E.');
      this.isSaving = false;
      return;
    }

    const imageUploadPromises: Promise<any>[] = [];
    const itemsData = itemsToUpdate.map((item) => {
      // Guardar las imágenes en memoria para subirlas después
      if (item.imagesNames?.length > 0 && item.images?.length > 0) {
        item.images.forEach((image: string, index: number) => {
          const formData = new FormData();
          formData.append('idInforme', idInforme.toString());
          formData.append('numeroInforme', numeroInforme);  // Añadir numeroInforme al FormData
          formData.append('idDetalle', item.idDetalle.toString());
          formData.append('foto', item.imagesNames[index]);
          formData.append('data', this.convertBase64ToBlob(item.images[index]));
          formData.append('numero', (index + 1).toString()); // Número de imagen
          formData.append('idStatus', item.idStatus.toString());

          const imageUploadPromise = lastValueFrom(this.telescopicaService.sendFotosTelescopica(formData));
          imageUploadPromises.push(imageUploadPromise);
        });
      }

      // Guardar las descripciones en el array
      if (item.descripcionNoCumple) {
        descripciones.push({
          descripcion: item.descripcionNoCumple,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
          idStatus: item.idStatus
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
      this.telescopicaService.editItemTelescopica(itemsData).subscribe({
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
            this.isEditingStatusE = false;
            this.isAnyEditing = false;

            if (descripciones.length > 0) {
              this.uploadDescripciones(descripciones);
            }

          } else {
            this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
            this.messageType = 'error';           
            this.refreshStatus();
            this.restoreOriginalValues();
            this.isSaving = false;
            this.isEditingStatusE = false;
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

  saveChangesStatusF() {
  if (this.selectedInforme) {
    this.isSaving = true; // Activa el spinner
    this.savingMessage = 'Guardando cambios, por favor espere...';

    const idInforme = this.selectedInforme.idInforme;
    const numeroInforme = this.selectedInforme.numeroInforme; // Asegúrate de tener el numeroInforme aquí

    // Array para almacenar las descripciones que se enviarán al backend
    const descripciones: { descripcion: string; idInforme: number; idDetalle: number; idStatus: number }[] = [];

    // Ajustar los índices para los ítems del 59 al 74 (índice 58 al 73)
    const itemsToUpdate = this.itemsWithStatus
      .slice(58, 74)
      .filter((item, index) => {
        const globalIndex = 58 + index; // Ajustar el índice global para comparación
        const originalItem = this.originalValues[globalIndex];

        // Asegurarse de que originalItem existe
        if (!originalItem) {
          console.log(`No se encontró el ítem original en la posición ${globalIndex}.`);
          return false;
        }

        // Verificar si el estado ha cambiado
        const estadoCambiado = item.idStatus !== originalItem.idStatus;

        return estadoCambiado;
      });

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems modificados para actualizar en la tabla F.');
      this.isSaving = false;
      return;
    }

    const imageUploadPromises: Promise<any>[] = [];
    const itemsData = itemsToUpdate.map((item) => {
      // Guardar las imágenes en memoria para subirlas después
      if (item.imagesNames?.length > 0 && item.images?.length > 0) {
        item.images.forEach((image: string, index: number) => {
          const formData = new FormData();
          formData.append('idInforme', idInforme.toString());
          formData.append('numeroInforme', numeroInforme);  // Añadir numeroInforme al FormData
          formData.append('idDetalle', item.idDetalle.toString());
          formData.append('foto', item.imagesNames[index]);
          formData.append('data', this.convertBase64ToBlob(item.images[index]));
          formData.append('numero', (index + 1).toString()); // Número de imagen
          formData.append('idStatus', item.idStatus.toString());

          const imageUploadPromise = lastValueFrom(this.telescopicaService.sendFotosTelescopica(formData));
          imageUploadPromises.push(imageUploadPromise);
        });
      }

      // Guardar las descripciones en el array
      if (item.descripcionNoCumple) {
        descripciones.push({
          descripcion: item.descripcionNoCumple,
          idInforme: idInforme,
          idDetalle: item.idDetalle,
          idStatus: item.idStatus
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
      this.telescopicaService.editItemTelescopica(itemsData).subscribe({
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
            this.isEditingStatusF = false;
            this.isAnyEditing = false;

            if (descripciones.length > 0) {
              this.uploadDescripciones(descripciones);
            }

          } else {
            this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
            this.messageType = 'error';           
            this.refreshStatus();
            this.restoreOriginalValues();
            this.isSaving = false;
            this.isEditingStatusF = false;
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

  saveFormHChanges() {
    if (this.formH.valid) {
      // Obtener solo los campos que fueron editados
      const editedFields: { [key: string]: any } = {};
      Object.keys(this.formH.controls).forEach((key) => {
        if (this.formH.get(key)?.dirty) {
          editedFields[key] = this.formH.get(key)?.value;
        }
      });

      // Enviar los campos modificados al backend
      if (Object.keys(editedFields).length > 0) {
        this.telescopicaService.editFormHTelescopica(editedFields).subscribe({
          next: (response) => {
            console.log('Formulario actualizado:', response);
            this.isEditingFormH = false;
          },
          error: (error) => {
            console.error('Error al guardar:', error);
          },
        });
      }
    } else {
      alert('Por favor complete los campos requeridos.');
    }
  }

  saveFormH1Changes() {
    if (this.formH1.valid) {
      const updatedData = {
        ...this.formH1.getRawValue(), // Obtener todos los valores del formulario H1
        idInforme: this.selectedInforme.idInforme, // Añadir ID del informe
      };

      // Llamada al servicio para guardar los datos
      this.telescopicaService.editFormH1Telescopica(updatedData).subscribe({
        next: (response) => {
          console.log('Formulario H1 actualizado exitosamente:', response);

          // Actualizar los valores en el formulario después de guardar
          this.formH1.patchValue({
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
            ganchoAuxResultado: updatedData.ganchoAuxResultado
          });

          // Actualizar la variable de visualización de comentarios
          this.formH1Data.comentarios = updatedData.comentarios;

          this.isEditingFormH1 = false;
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
        },
        error: (error) => {
          console.error('Error al actualizar el formulario H1:', error);
          this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        },
      });
    } else {
      alert('Por favor completa todos los campos antes de guardar.');
    }
}

  saveFormH2Changes() {
    if (this.formH2.valid) {
      const formH2Data = {
        ...this.formH2.value,
        idInforme: this.selectedInforme.idInforme, // Asegúrate de tener `selectedInforme` definido
        idUser: this.selectedInforme.idUser, // Si necesitas enviar el id del usuario
      };

      // Llamada al servicio para guardar los datos
      this.telescopicaService.editFormH2Telescopica(formH2Data).subscribe({
        next: (response) => {
          console.log('Formulario H2 actualizado exitosamente', response);
          this.isEditingFormH2 = false;
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
        },
        error: (error) => {
          console.error('Error al actualizar el formulario H2', error);
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
      console.log('No se encontraron descripciones modificadas para actualizar.');
      this.isSaving = false;
      this.isEditingFormG = false; // Usar isEditingFormG en vez de isEditingDescription
      return;
    }

    let success = true;
    descripcionesToUpdate.forEach((descripcionData, index) => {
      this.telescopicaService
        .editDescripcionTelescopica(descripcionData)
        .subscribe({
          next: (response) => {
            if (!response.success) {
              success = false;
              console.error('Error al actualizar algunas descripciones:', response.message);
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
                this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
                this.messageType = 'error';
              }

              this.isSaving = false;
              this.isEditingFormG = false; // Cambiar a isEditingFormG en vez de isEditingDescription
              setTimeout(() => (this.showMessage = false), 3000);
            }
          },
        });
    });
  }
}

  saveFormIChanges() {
    if (this.informeForm.get('idResul')?.valid) {
      // Copiamos todos los valores actuales del formulario
      const currentFormData = this.informeForm.getRawValue(); // Obtiene todos los valores del formulario, incluso si están deshabilitados

      // Solo cambiamos el idResul y mantenemos el resto de los campos igual
      const formIData = {
        ...currentFormData, // Mantenemos los valores actuales del formulario
        idResul: this.informeForm.get('idResul')?.value, // Actualizamos solo el idResul
        idInforme: this.selectedInforme.idInforme, // Incluimos idInforme
      };

      // Llamada al servicio para actualizar solo el idResul sin modificar otros campos
      this.telescopicaService.editInformeTelescopicas(formIData).subscribe({
        next: (response) => {
          console.log('idResul actualizado exitosamente', response);
          this.isEditingFormI = false;
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

  refreshNonConformities() {
    this.loadNonConformities(this.selectedInforme.idInforme);
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
    uploadImageService: this.telescopicaService.sendFotosTelescopica.bind(this.telescopicaService), // Servicio de subida
  };
}

  closeModal(modalData: { description: string; images: string[]; imagesNames: string[] }): void {
  if (this.currentItemIndex !== null) {
    const currentItem = this.itemsWithStatus[this.currentItemIndex];

    // Actualizar la descripción
    currentItem.descripcionNoCumple = modalData.description;

    // Si allowImages es true, manejar las imágenes, de lo contrario, ignorarlas
    if (this.allowImages) {
      // Reiniciar las imágenes antes de agregar las nuevas para evitar duplicados
      currentItem.images = [...modalData.images];
      currentItem.imagesNames = [...modalData.imagesNames];

      // Verificar que no se estén duplicando imágenes antes de subir
      if (currentItem.images.length > 0 && currentItem.imagesNames.length === currentItem.images.length) {
        console.log('Imágenes almacenadas en el item:', currentItem.images);
        console.log('Nombres de imágenes almacenados en el item:', currentItem.imagesNames);
      } else {
        console.error('Error: Las imágenes y los nombres de las imágenes no coinciden.');
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
  this.telescopicaService.postDescripcionTelescopica({ descripciones }).subscribe({
    next: (response) => {
      if (response.success) {
        console.log('Descripciones subidas exitosamente.');
        this.showMessage = true;
        this.messageText = 'Datos actualizados exitosamente.';
        this.messageType = 'success';
        this.isAnyEditing = false;

        this.refreshNonConformities();
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

private finalizeSaveChanges() {
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
      resolve(true);  // Confirmar la acción
      this.showMessage = false;  // Ocultar el modal
    };

    this.onCancel = () => {
      resolve(false);  // Cancelar la acción
      this.showMessage = false;  // Ocultar el modal
    };
  });
}

} 
