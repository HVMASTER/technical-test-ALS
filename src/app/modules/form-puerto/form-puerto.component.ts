import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PuertoService } from './services/puerto.service';
import { PdfService } from '../../services/pdf.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-form-puerto',
  templateUrl: './form-puerto.component.html',
  styleUrl: './form-puerto.component.scss'
})
export class FormPuertoComponent implements OnInit, OnDestroy{
  informes: any[] = [];
  informeForm: FormGroup;
  formE: FormGroup;
  formE1: FormGroup;
  modalInstance: any = null;
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
  isEditingStatusD = false;
  isEditingStatusE = false;
  isEditingFormD = false;
  isEditingFormE = false;
  isEditingFormE1 = false;
  isEditingFormF = false;
  isLoading = false;
  isLoadingPdf = false;
  isSaving = false;
  isEditing = false;
  isPreviewMode = false;
  showHeaderFooter = false;
  allowImages = false;
  showModal = false;
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
      nombreRutInspector: ['', [Validators.required, Validators.maxLength(100)]],
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
      this.puertoService.deleteDescripcionPuerto(descripcionData)
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
      this.puertoService.getFotoByIdInformePuerto(idInforme)
    );

    if (fotosResponse && fotosResponse.photos) {
      const fotosFiltradas = fotosResponse.photos.filter((foto: any) => foto.idDetalle === idDetalle);

      if (fotosFiltradas.length > 0) {
        for (const foto of fotosFiltradas) {
          const fotoData = {
            idInforme: idInforme,
            idDetalle: idDetalle,
            numeroInforme: numeroInforme,
            foto: foto.foto,
          };
          await lastValueFrom(this.puertoService.deleteFotoPuertoByIdDetalle(fotoData));
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
    this.puertoService
      .getSetFotograficoByIdInformePuerto(idInforme)
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

  refreshStatus() {
    if (this.selectedInforme) {
      this.loadItemDetails(this.selectedInforme.idInforme);
    }
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

  // Método para mostrar/ocultar la fila de Gancho Principal
  toggleGanchoPrincipal() {
    if (this.formEData?.ganchoPrincipal > 0) {
      this.showGanchoPrincipal = !this.showGanchoPrincipal;
    }
  }

  // Método para mostrar/ocultar la fila de Gancho Auxiliar
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
      const informeData = {
        ...this.informeForm.value,
        idInforme: this.selectedInforme.idInforme,
        idUser: this.selectedInforme.idUser,
      };

    //   this.formService.editInformePuente(informeData).subscribe({
    //     next: (response) => {
    //       console.log('Datos actualizados exitosamente:', response);
    //       this.isEditing = false;
    //       this.isEditingFormI = false;
    //       this.showMessage = true;
    //       this.messageText = 'Datos actualizados exitosamente.';
    //       this.messageType = 'success';
    //       // Ocultar el mensaje después de unos segundos
    //       setTimeout(() => this.showMessage = false, 3000);
    //     },
    //     error: (error) => {
    //       console.error('Error al actualizar los datos:', error);
    //       this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
    //       this.messageType = 'error';
    //       this.showMessage = true;
    //     },
    //   });
    // } else {
    //   alert('Por favor, revisa los datos antes de guardar.');
    // }
  }
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
    uploadImageService: this.puertoService.sendFotosPuerto.bind(this.puertoService), // Servicio de subida
  };
}

  closeModal(modalData: { description: string; images: string[]; imagesNames: string[] }): void {
  if (this.currentItemIndex !== null) {
    const currentItem = this.itemsWithStatus[this.currentItemIndex];
    currentItem.descripcionNoCumple = modalData.description;

    // Si allowImages es true, manejar las imágenes, de lo contrario, ignorarlas
    if (this.allowImages) {
      currentItem.images = [...modalData.images];
      currentItem.imagesNames = modalData.images.map((index) => `${Date.now()}.png`);

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
