import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-report-modal-component',
  templateUrl: './report-modal-component.component.html',
  styleUrls: ['./report-modal-component.component.scss'],
})
export class ReportModalComponentComponent {
  @Input() idInforme!: any;
  @Input() idDetalle!: any;
  @Input() idStatus!: any;
  @Input() numeroInforme!: string;
  @Input() allowImages: boolean = true;
  // Recibir el servicio de subida como input
  @Input() uploadImageService!: (formData: FormData) => any; 

  @Output() save = new EventEmitter<{
    description: string;
    descripFoto: string[];
    images: string[];
    imagesNames: any[];
  }>();
  @Output() cancel = new EventEmitter<void>();

  description: string = '';
  images: any[] = []; 
  imageBlobs: Blob[] = []; 
  imageNames: any[] = [];
  descripFoto: string[] = [];

  // Propiedad para habilitar/deshabilitar el botón de guardar
  get canSave(): boolean {
    return this.description.trim().length > 0 && (!this.allowImages || this.images.length === 2);
  }

  // Manejo de archivos seleccionados
  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const imageName = `${Date.now()}.png`;
      this.imageNames.push(imageName);
      const base64Image = await this.convertBlobToBase64(file);
      this.images.push(base64Image); 
      this.imageBlobs.push(file);
      this.descripFoto.push('');
    }
  }

  // Conversión de BLOB a Base64 para visualización
  convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  }

  // Eliminar imagen
  removeImage(index: number) {
    this.images.splice(index, 1); // Eliminar de la lista de imágenes base64
    this.imageBlobs.splice(index, 1); // Eliminar el blob de la imagen
    this.imageNames.splice(index, 1); // Eliminar el nombre de la imagen
    this.descripFoto.splice(index, 1); // Eliminar la descripción de la imagen
  }

  // Guardar datos del modal
  onSave() {
    if (this.description && (!this.allowImages || this.images.length === 2)) {
      this.save.emit({
        description: this.description,
        descripFoto: this.descripFoto,
        images: this.images,
        imagesNames: this.imageNames  
      });
    } else {
      alert(this.allowImages ? 'Por favor, ingrese una descripción y suba al menos 2 imágenes.' : 'Por favor, ingrese una descripción.');
    }
  }

  // Cancelar acción
  onCancel() {
    this.cancel.emit();
  }
}