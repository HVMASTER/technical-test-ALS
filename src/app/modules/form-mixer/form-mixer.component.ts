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
  originalValues: any;
  photoUrl: string = '';
  savingMessage = '';
  isSaving = false; 
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
  isPreviewMode = false;
  showHeaderFooter = false;
  isLoading = false;
  showMessage = false;
  defaultEmptyRows = new Array(7);
  retryCount = 0;
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
    this.photos = []; // Limpiar las fotos anteriores
    this.mixerService
      .getSetFotograficoByIdInformeMixer(idInforme)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.photos.length > 0) {
            const validPhotos = response.photos.filter((photo: any) => this.isValidBase64(photo.data));

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
    const base64Regex = /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
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

  handleError(error?: any) {
    console.error('Error actualizando los datos', error);
    this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
    this.messageType = 'error';
    this.showMessage = true;
    setTimeout(() => this.showMessage = false, 3000);
  }

  toggleEdit() {
    if (!this.isEditing) {
      this.originalValues = this.formMixerMain.getRawValue();
      this.formMixerMain.enable();
    } else {
      this.formMixerMain.patchValue(this.originalValues);
      this.formMixerMain.disable();
    }
    this.isEditing = !this.isEditing;
  }

  toggleEditStatusA() {
    if (!this.isEditingStatusA) {
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
    this.isEditingStatusA = !this.isEditingStatusA;
  }

  toggleEditStatusB() {
    if (!this.isEditingStatusB) {
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
    this.isEditingStatusB = !this.isEditingStatusB; 
  }

  toggleEditStatusC() {
    if (!this.isEditingStatusC) {
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
    this.isEditingStatusC = !this.isEditingStatusC;
  }

  toggleEditStatusD() {
    if (!this.isEditingStatusD) {
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
    this.isEditingStatusD = !this.isEditingStatusD;
  }

  toggleEditStatusE() {
    if (!this.isEditingStatusE) {
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
    this.isEditingStatusE = !this.isEditingStatusE;
  }

  toggleEditStatusF() {
    if (!this.isEditingStatusF) {
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
    this.isEditingStatusF = !this.isEditingStatusF;
  }

  toggleEditStatusG() {
    if (!this.isEditingStatusG) {
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
    this.isEditingStatusG = !this.isEditingStatusG;
  }

  toggleEditStatusH() {
    if (!this.isEditingStatusH) {
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
    this.isEditingStatusH = !this.isEditingStatusH;
  }

  toggleEditStatusI() {
    if (!this.isEditingStatusI) {
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
    this.isEditingStatusI = !this.isEditingStatusI;
  }

  toggleEditStatusJ() {
    if (!this.isEditingStatusJ) {
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
    this.isEditingStatusJ = !this.isEditingStatusJ;
  }

  toggleEditStatusK() {
    if (!this.isEditingStatusK) {
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
    this.isEditingStatusK = !this.isEditingStatusK;
  }

  toggleEditStatusL() {
    if (!this.isEditingStatusL) {
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
    this.isEditingStatusL = !this.isEditingStatusL;
  }

  toggleEditStatusM() {
    if (!this.isEditingStatusM) {
      this.originalValues = this.itemsWithStatus.map((item) => ({
        ...item,
      }));
    } else {
      this.itemsWithStatus = this.originalValues.map((item: any) => ({
        ...item,
      }));
    }
    this.isEditingStatusM = !this.isEditingStatusM;
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
          setTimeout(() => this.showMessage = false, 3000);
        },
        error: (error) => {
          console.error('Error al actualizar los datos:', error);
          this.showMessage = true;
          this.messageText = error.message;
          this.messageType = 'error';
          this.isEditing = false;
          this.formMixerMain.disable();
        },
      });
    } else {
      alert('Por favor, revisa los datos antes de guardar');
    }
  }

  saveChangesStatusA(retryCount: number = 3) {
  if (this.selectedInforme) {

    this.isSaving = true; // Activar el spinner
    this.savingMessage = 'Guardando cambios, por favor espere...'; 

    const idInforme = this.selectedInforme.idInforme;
    const itemsToUpdate = this.itemsWithStatus.slice(0, 19);

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems para actualizar en la tabla A.');
      return;
    }

    const updatePromises = itemsToUpdate.map(item => {
      const itemData = {
        idStatus: item.idStatus,
        idInforme: idInforme,
        idDetalle: item.idDetalle
      };

      return this.mixerService.editItemMixer(itemData).toPromise();
    });

    Promise.all(updatePromises)
      .then((responses) => {
        if (responses.every(response => response.success)) {
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
        } else {
          this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        }
        this.isSaving = false;  // Desactivar el spinner
      })
      .catch((error) => {
        if (retryCount > 0 && error?.status === 500 && error?.error?.message?.includes("Deadlock")) {
          console.log('Deadlock detected, retrying...');
          this.retryCount = retryCount;
          this.savingMessage = `Reintentando... (${4 - retryCount} de 3)`;  // Mensaje de reintento
          setTimeout(() => this.saveChangesStatusA(retryCount - 1), 2000); // Reintentar después de un breve retraso
        } else {
          this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
          console.error('Error actualizando los datos:', error);
          this.isSaving = false; // Desactivar el spinner
          this.restoreOriginalValues();
          this.refreshStatus();
        }
      });

    this.isEditingStatusA = false;
  }
}

  saveChangesStatusB(retryCount: number = 3) {
    if (this.selectedInforme) {
    
    this.isSaving = true; // Activar el spinner
    this.savingMessage = 'Guardando cambios, por favor espere...'; 


    const idInforme = this.selectedInforme.idInforme;
    const itemsToUpdate = this.itemsWithStatus.slice(19, 28);

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems para actualizar en la tabla B.');
      return;
    }

    const updatePromises = itemsToUpdate.map(item => {
      const itemData = {
        idStatus: item.idStatus,
        idInforme: idInforme,
        idDetalle: item.idDetalle
      };

      return this.mixerService.editItemMixer(itemData).toPromise();
    });

    Promise.all(updatePromises)
      .then((responses) => {
        if (responses.every(response => response.success)) {
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
        } else {
          this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        }
          this.isSaving = false;  // Desactivar el spinner
      })
      .catch((error) => {
        if (retryCount > 0 && error?.status === 500 && error?.error?.message?.includes("Deadlock")) {
          console.log('Deadlock detected, retrying...');
          this.retryCount = retryCount;
          this.savingMessage = `Reintentando... (${4 - retryCount} de 3)`;  // Mensaje de reintento
          setTimeout(() => this.saveChangesStatusA(retryCount - 1), 2000); // Reintentar después de un breve retraso
        } else {
          this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
          console.error('Error actualizando los datos:', error);
          this.isSaving = false; // Desactivar el spinner
          this.restoreOriginalValues();
          this.refreshStatus();
        }
      });

    this.isEditingStatusB = false; // Deshabilitar el modo de edición después de guardar
    }
  }

  saveChangesStatusC(retryCount: number = 3) {
    if (this.selectedInforme) {

    this.isSaving = true; // Activar el spinner
    this.savingMessage = 'Guardando cambios, por favor espere...';

    const idInforme = this.selectedInforme.idInforme;
    const itemsToUpdate = this.itemsWithStatus.slice(28, 39);

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems para actualizar en la tabla C.');
      return;
    }

    const updatePromises = itemsToUpdate.map(item => {
      const itemData = {
        idStatus: item.idStatus,
        idInforme: idInforme,
        idDetalle: item.idDetalle
      };

      return this.mixerService.editItemMixer(itemData).toPromise();
    });

    Promise.all(updatePromises)
      .then((responses) => {
        if (responses.every(response => response.success)) {
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
        } else {
          this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        }
          this.isSaving = false;  // Desactivar el spinner
      })
      .catch((error) => {
        if (retryCount > 0 && error?.status === 500 && error?.error?.message?.includes("Deadlock")) {
          console.log('Deadlock detected, retrying...');
          this.retryCount = retryCount;
          this.savingMessage = `Reintentando... (${4 - retryCount} de 3)`;  // Mensaje de reintento
          setTimeout(() => this.saveChangesStatusA(retryCount - 1), 2000); // Reintentar después de un breve retraso
        } else {
          this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
          console.error('Error actualizando los datos:', error);
          this.isSaving = false; // Desactivar el spinner
          this.restoreOriginalValues();
          this.refreshStatus();
        }
      });

    this.isEditingStatusC = false; // Deshabilitar el modo de edición después de guardar
    }
  }

  saveChangesStatusD(retryCount: number = 3) {
    if (this.selectedInforme) {
    
    this.isSaving = true; // Activar el spinner

    const idInforme = this.selectedInforme.idInforme;
    const itemsToUpdate = this.itemsWithStatus.slice(39, 49);

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems para actualizar en el formulario Mixer.');
      return;
    }

    const updatePromises = itemsToUpdate.map(item => {
      const itemData = {
        idStatus: item.idStatus,
        idInforme: idInforme,
        idDetalle: item.idDetalle
      };

      return this.mixerService.editItemMixer(itemData).toPromise();
    });

    Promise.all(updatePromises)
      .then((responses) => {
        if (responses.every(response => response.success)) {
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
        } else {
          this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        }
          this.isSaving = false;  // Desactivar el spinner
      })
      .catch((error) => {
        if (retryCount > 0 && error?.status === 500 && error?.error?.message?.includes("Deadlock")) {
          console.log('Deadlock detected, retrying...');
          this.retryCount = retryCount;
          this.savingMessage = `Reintentando... (${4 - retryCount} de 3)`;  // Mensaje de reintento
          setTimeout(() => this.saveChangesStatusA(retryCount - 1), 2000); // Reintentar después de un breve retraso
        } else {
          this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
          console.error('Error actualizando los datos:', error);
          this.isSaving = false; // Desactivar el spinner
          this.restoreOriginalValues();
          this.refreshStatus();
        }
      });

    this.isEditingStatusD = false; // Deshabilitar el modo de edición después de guardar
    }
  }

  saveChangesStatusE(retryCount: number = 3) {
    if (this.selectedInforme) {
    
    this.isSaving = true; // Activar el spinner

    const idInforme = this.selectedInforme.idInforme;
    const itemsToUpdate = this.itemsWithStatus.slice(49, 60);

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems para actualizar en la tabla E.');
      return;
    }

    const updatePromises = itemsToUpdate.map(item => {
      const itemData = {
        idStatus: item.idStatus,
        idInforme: idInforme,
        idDetalle: item.idDetalle
      };

      return this.mixerService.editItemMixer(itemData).toPromise();
    });

    Promise.all(updatePromises)
      .then((responses) => {
        if (responses.every(response => response.success)) {
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
        } else {
          this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        }
          this.isSaving = false;  // Desactivar el spinner
      })
      .catch((error) => {
        if (retryCount > 0 && error?.status === 500 && error?.error?.message?.includes("Deadlock")) {
          console.log('Deadlock detected, retrying...');
          this.retryCount = retryCount;
          this.savingMessage = `Reintentando... (${4 - retryCount} de 3)`;  // Mensaje de reintento
          setTimeout(() => this.saveChangesStatusA(retryCount - 1), 2000); // Reintentar después de un breve retraso
        } else {
          this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
          console.error('Error actualizando los datos:', error);
          this.isSaving = false; // Desactivar el spinner
          this.restoreOriginalValues();
          this.refreshStatus();
        }
      });

    this.isEditingStatusE = false; // Deshabilitar el modo de edición después de guardar
    }
  }

  saveChangesStatusF(retryCount: number = 3) {
    if (this.selectedInforme) {
    
    this.isSaving = true; // Activar el spinner

    const idInforme = this.selectedInforme.idInforme;
    const itemsToUpdate = this.itemsWithStatus.slice(60, 67);

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems para actualizar en la tabla F.');
      return;
    }

    const updatePromises = itemsToUpdate.map(item => {
      const itemData = {
        idStatus: item.idStatus,
        idInforme: idInforme,
        idDetalle: item.idDetalle
      };

      return this.mixerService.editItemMixer(itemData).toPromise();
    });

    Promise.all(updatePromises)
      .then((responses) => {
        if (responses.every(response => response.success)) {
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
        } else {
          this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        }
          this.isSaving = false;  // Desactivar el spinner
      })
      .catch((error) => {
        if (retryCount > 0 && error?.status === 500 && error?.error?.message?.includes("Deadlock")) {
          console.log('Deadlock detected, retrying...');
          this.retryCount = retryCount;
          this.savingMessage = `Reintentando... (${4 - retryCount} de 3)`;  // Mensaje de reintento
          setTimeout(() => this.saveChangesStatusA(retryCount - 1), 2000); // Reintentar después de un breve retraso
        } else {
          this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
          console.error('Error actualizando los datos:', error);
          this.isSaving = false; // Desactivar el spinner
          this.restoreOriginalValues();
          this.refreshStatus();
        }
      });

    this.isEditingStatusF = false; // Deshabilitar el modo de edición después de guardar
    }
  }

  saveChangesStatusG(retryCount: number = 3) {
    if (this.selectedInforme) {
    
    this.isSaving = true; // Activar el spinner

    const idInforme = this.selectedInforme.idInforme;
    const itemsToUpdate = this.itemsWithStatus.slice(67, 72);

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems para actualizar en la tabla G.');
      return;
    }

    const updatePromises = itemsToUpdate.map(item => {
      const itemData = {
        idStatus: item.idStatus,
        idInforme: idInforme,
        idDetalle: item.idDetalle
      };

      return this.mixerService.editItemMixer(itemData).toPromise();
    });

    Promise.all(updatePromises)
      .then((responses) => {
        if (responses.every(response => response.success)) {
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
        } else {
          this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        }
          this.isSaving = false;  // Desactivar el spinner
      })
      .catch((error) => {
        if (retryCount > 0 && error?.status === 500 && error?.error?.message?.includes("Deadlock")) {
          console.log('Deadlock detected, retrying...');
          this.retryCount = retryCount;
          this.savingMessage = `Reintentando... (${4 - retryCount} de 3)`;  // Mensaje de reintento
          setTimeout(() => this.saveChangesStatusA(retryCount - 1), 2000); // Reintentar después de un breve retraso
        } else {
          this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
          console.error('Error actualizando los datos:', error);
          this.isSaving = false; // Desactivar el spinner
          this.restoreOriginalValues();
          this.refreshStatus();
        }
      });

    this.isEditingStatusG = false; // Deshabilitar el modo de edición después de guardar
    }
  }

  saveChangesStatusH(retryCount: number = 3) {
    if (this.selectedInforme) {
    
    this.isSaving = true; // Activar el spinner

    const idInforme = this.selectedInforme.idInforme;
    const itemsToUpdate = this.itemsWithStatus.slice(72, 87);

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems para actualizar en la tabla H.');
      return;
    }

    const updatePromises = itemsToUpdate.map(item => {
      const itemData = {
        idStatus: item.idStatus,
        idInforme: idInforme,
        idDetalle: item.idDetalle
      };

      return this.mixerService.editItemMixer(itemData).toPromise();
    });

    Promise.all(updatePromises)
      .then((responses) => {
        if (responses.every(response => response.success)) {
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
        } else {
          this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        }
          this.isSaving = false;  // Desactivar el spinner
      })
      .catch((error) => {
        if (retryCount > 0 && error?.status === 500 && error?.error?.message?.includes("Deadlock")) {
          console.log('Deadlock detected, retrying...');
          this.retryCount = retryCount;
          this.savingMessage = `Reintentando... (${4 - retryCount} de 3)`;  // Mensaje de reintento
          setTimeout(() => this.saveChangesStatusA(retryCount - 1), 2000); // Reintentar después de un breve retraso
        } else {
          this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
          console.error('Error actualizando los datos:', error);
          this.isSaving = false; // Desactivar el spinner
          this.restoreOriginalValues();
          this.refreshStatus();
        }
      });

    this.isEditingStatusH = false; // Deshabilitar el modo de edición después de guardar
    }
  }

  saveChangesStatusI(retryCount: number = 3) {
    if (this.selectedInforme) {
    
    this.isSaving = true; // Activar el spinner

    const idInforme = this.selectedInforme.idInforme;
    const itemsToUpdate = this.itemsWithStatus.slice(87, 96);

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems para actualizar en la tabla I.');
      return;
    }

    const updatePromises = itemsToUpdate.map(item => {
      const itemData = {
        idStatus: item.idStatus,
        idInforme: idInforme,
        idDetalle: item.idDetalle
      };

      return this.mixerService.editItemMixer(itemData).toPromise();
    });

    Promise.all(updatePromises)
      .then((responses) => {
        if (responses.every(response => response.success)) {
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
        } else {
          this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        }
          this.isSaving = false;  // Desactivar el spinner
      })
      .catch((error) => {
        if (retryCount > 0 && error?.status === 500 && error?.error?.message?.includes("Deadlock")) {
          console.log('Deadlock detected, retrying...');
          this.retryCount = retryCount;
          this.savingMessage = `Reintentando... (${4 - retryCount} de 3)`;  // Mensaje de reintento
          setTimeout(() => this.saveChangesStatusA(retryCount - 1), 2000); // Reintentar después de un breve retraso
        } else {
          this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
          console.error('Error actualizando los datos:', error);
          this.isSaving = false; // Desactivar el spinner
          this.restoreOriginalValues();
          this.refreshStatus();
        }
      });

    this.isEditingStatusI = false; // Deshabilitar el modo de edición después de guardar
    }
  }

  saveChangesStatusJ(retryCount: number = 3) {
    if (this.selectedInforme) {
    
    this.isSaving = true; // Activar el spinner

    const idInforme = this.selectedInforme.idInforme;
    const itemsToUpdate = this.itemsWithStatus.slice(96, 101);

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems para actualizar en la tabla J.');
      return;
    }

    const updatePromises = itemsToUpdate.map(item => {
      const itemData = {
        idStatus: item.idStatus,
        idInforme: idInforme,
        idDetalle: item.idDetalle
      };

      return this.mixerService.editItemMixer(itemData).toPromise();
    });

    Promise.all(updatePromises)
      .then((responses) => {
        if (responses.every(response => response.success)) {
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
        } else {
          this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        }
          this.isSaving = false;  // Desactivar el spinner
      })
      .catch((error) => {
        if (retryCount > 0 && error?.status === 500 && error?.error?.message?.includes("Deadlock")) {
          console.log('Deadlock detected, retrying...');
          this.retryCount = retryCount;
          this.savingMessage = `Reintentando... (${4 - retryCount} de 3)`;  // Mensaje de reintento
          setTimeout(() => this.saveChangesStatusA(retryCount - 1), 2000); // Reintentar después de un breve retraso
        } else {
          this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
          console.error('Error actualizando los datos:', error);
          this.isSaving = false; // Desactivar el spinner
          this.restoreOriginalValues();
          this.refreshStatus();
        }
      });

    this.isEditingStatusJ = false; // Deshabilitar el modo de edición después de guardar
    }
  }

  saveChangesStatusK(retryCount: number = 3) {
    if (this.selectedInforme) {
    
    this.isSaving = true; // Activar el spinner

    const idInforme = this.selectedInforme.idInforme;
    const itemsToUpdate = this.itemsWithStatus.slice(101, 106);

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems para actualizar en la tabla K.');
      return;
    }

    const updatePromises = itemsToUpdate.map(item => {
      const itemData = {
        idStatus: item.idStatus,
        idInforme: idInforme,
        idDetalle: item.idDetalle
      };

      return this.mixerService.editItemMixer(itemData).toPromise();
    });

    Promise.all(updatePromises)
      .then((responses) => {
        if (responses.every(response => response.success)) {
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
        } else {
          this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        }
          this.isSaving = false;  // Desactivar el spinner
      })
      .catch((error) => {
        if (retryCount > 0 && error?.status === 500 && error?.error?.message?.includes("Deadlock")) {
          console.log('Deadlock detected, retrying...');
          this.retryCount = retryCount;
          this.savingMessage = `Reintentando... (${4 - retryCount} de 3)`;  // Mensaje de reintento
          setTimeout(() => this.saveChangesStatusA(retryCount - 1), 2000); // Reintentar después de un breve retraso
        } else {
          this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
          console.error('Error actualizando los datos:', error);
          this.isSaving = false; // Desactivar el spinner
          this.restoreOriginalValues();
          this.refreshStatus();
        }
      });

    this.isEditingStatusK = false; // Deshabilitar el modo de edición después de guardar
    }
  }

  saveChangesStatusL(retryCount: number = 3) {
    if (this.selectedInforme) {
    
    this.isSaving = true; // Activar el spinner

    const idInforme = this.selectedInforme.idInforme;
    const itemsToUpdate = this.itemsWithStatus.slice(106, 113);

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems para actualizar en la tabla L.');
      return;
    }

    const updatePromises = itemsToUpdate.map(item => {
      const itemData = {
        idStatus: item.idStatus,
        idInforme: idInforme,
        idDetalle: item.idDetalle
      };

      return this.mixerService.editItemMixer(itemData).toPromise();
    });

    Promise.all(updatePromises)
      .then((responses) => {
        if (responses.every(response => response.success)) {
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
        } else {
          this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        }
          this.isSaving = false;  // Desactivar el spinner
      })
      .catch((error) => {
        if (retryCount > 0 && error?.status === 500 && error?.error?.message?.includes("Deadlock")) {
          console.log('Deadlock detected, retrying...');
          this.retryCount = retryCount;
          this.savingMessage = `Reintentando... (${4 - retryCount} de 3)`;  // Mensaje de reintento
          setTimeout(() => this.saveChangesStatusA(retryCount - 1), 2000); // Reintentar después de un breve retraso
        } else {
          this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
          console.error('Error actualizando los datos:', error);
          this.isSaving = false; // Desactivar el spinner
          this.restoreOriginalValues();
          this.refreshStatus();
        }
      });

    this.isEditingStatusL = false; // Deshabilitar el modo de edición después de guardar
    }
  }

  saveChangesStatusM(retryCount: number = 3) {
    if (this.selectedInforme) {
    
    this.isSaving = true; // Activar el spinner

    const idInforme = this.selectedInforme.idInforme;
    const itemsToUpdate = this.itemsWithStatus.slice(113, 123);

    if (itemsToUpdate.length === 0) {
      console.log('No se encontraron ítems para actualizar en la tabla M.');
      return;
    }

    const updatePromises = itemsToUpdate.map(item => {
      const itemData = {
        idStatus: item.idStatus,
        idInforme: idInforme,
        idDetalle: item.idDetalle
      };

      return this.mixerService.editItemMixer(itemData).toPromise();
    });

    Promise.all(updatePromises)
      .then((responses) => {
        if (responses.every(response => response.success)) {
          this.showMessage = true;
          this.messageText = 'Datos actualizados exitosamente.';
          this.messageType = 'success';
          setTimeout(() => (this.showMessage = false), 3000);
        } else {
          this.messageText = 'Error al guardar algunos datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
        }
          this.isSaving = false;  // Desactivar el spinner
      })
      .catch((error) => {
        if (retryCount > 0 && error?.status === 500 && error?.error?.message?.includes("Deadlock")) {
          console.log('Deadlock detected, retrying...');
          this.retryCount = retryCount;
          this.savingMessage = `Reintentando... (${4 - retryCount} de 3)`;  // Mensaje de reintento
          setTimeout(() => this.saveChangesStatusA(retryCount - 1), 2000); // Reintentar después de un breve retraso
        } else {
          this.messageText = 'Error al actualizar los datos. Inténtalo de nuevo.';
          this.messageType = 'error';
          this.showMessage = true;
          console.error('Error actualizando los datos:', error);
          this.isSaving = false; // Desactivar el spinner
          this.restoreOriginalValues();
          this.refreshStatus();
        }
      });

    this.isEditingStatusM = false; // Deshabilitar el modo de edición después de guardar
    }
  }

}
