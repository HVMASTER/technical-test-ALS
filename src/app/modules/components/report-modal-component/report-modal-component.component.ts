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
    images: string[];
    imagesNames: any[];
  }>();
  @Output() cancel = new EventEmitter<void>();

  description: string = '';
  images: any[] = []; 
  imageBlobs: Blob[] = []; 
  imageNames: any[] = [];

  // Propiedad para habilitar/deshabilitar el botón de guardar
  get canSave(): boolean {
    return this.description.trim().length > 0 && this.images.length == 2;
  }

  // Manejo de archivos seleccionados
  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.imageNames.push(file.name);
      const base64Image = await this.convertBlobToBase64(file);
      this.images.push(base64Image); 
      this.imageBlobs.push(file);
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
  }

  // Guardar datos del modal
  onSave() {
  if (this.description && this.images.length >= 2) {
    this.save.emit({
      description: this.description,
      images: this.images,  // Solo mandamos las imágenes base64 para almacenarlas temporalmente
      imagesNames: this.imageNames  // Los nombres de las imágenes también
    });
  } else {
    alert('Por favor, ingrese una descripción y suba al menos 2 imágenes.');
  }
}

  // Cancelar acción
  onCancel() {
    this.cancel.emit();
  }
}