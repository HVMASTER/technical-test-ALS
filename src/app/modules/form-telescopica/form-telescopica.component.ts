import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { TelescopicaService } from './services/telescopica.service';
import { PdfService } from '../../services/pdf.service';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  originalValues: any;
  selectedInforme: any | null = null;
  isEditing = false;
  showMessage = false;
  isPreviewMode = false;
  showHeaderFooter = false;
  isLoadingPdf = false;
  messageText = '';
  messageType = '';
  savingMessage = '';
  informeForm: FormGroup;
  // formH: FormGroup;
  // formH1: FormGroup;
  // formH2: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private telescopicaService: TelescopicaService,
    private pdfService: PdfService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.informeForm = this.createFormGroup();
    // this.formH = this.createFormH();
    // this.formH1 = this.createFormH1();
    // this.formH2 = this.createFormH2();
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

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
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
          // this.loadFormH(informe.idInforme);
          // this.loadFormH1(informe.idInforme);
          // this.loadFormH2(informe.idInforme);
          // this.loadSetFotografico(informe.idInforme);
        },
        error: (error) => {
          console.error('Error fetching informe details:', error);
        },
      });
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
          //this.loadDescripcion(idInforme);

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

} 
