import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-photographic-set-modal',
  templateUrl: './photographic-set-modal.component.html',
  styleUrl: './photographic-set-modal.component.scss'
})
export class PhotographicSetModalComponent {
  @Input() idInforme!: any;
  @Input() numeroInforme!: string;
  @Input() allowImages: boolean = true;

  // Servicio de subida de imágenes
  @Input() uploadImageService!: (formData: FormData) => any;

  @Output() save = new EventEmitter<{
    descripcionSF: string[];
    images: Blob[];
    imageNames: string[];
  }>();
  @Output() cancel = new EventEmitter<void>();

  descripcionSF: string[] = []; // Descripción para cada imagen
  images: any[] = []; // Imágenes en base64
  imageBlobs: Blob[] = []; // Blobs de imágenes
  imageNames: any[] = []; // Nombres de las imágenes
  currentImageIndex: number = 0; // Para controlar el índice actual de la imagen que se está subiendo

  // Propiedad para habilitar/deshabilitar el botón de guardar
  get canSave(): boolean {
    return (
      this.images.length === 2 && // Asegurarse de que haya 2 imágenes
      this.descripcionSF.length === 2 && // Asegurarse de que haya 2 descripciones
      this.descripcionSF.every(desc => desc.trim().length > 0) // Verificar que cada descripción no esté vacía
    );
  }

  // Manejo de archivos seleccionados
  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const imageName = `${Date.now()}-${this.currentImageIndex}.png`;
      this.imageNames.push(imageName);
      const base64Image = await this.convertBlobToBase64(file);
      this.images.push(base64Image); 
      this.imageBlobs.push(file);
      this.descripcionSF.push(''); // Inicializar descripción vacía
      this.currentImageIndex++;
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
    this.descripcionSF.splice(index, 1); // Eliminar la descripción asociada a esa imagen
    this.currentImageIndex--;
  }

  // Guardar datos del modal
  onSave() {
    if (this.canSave) {
      this.save.emit({
        descripcionSF: this.descripcionSF, // descripción para cada imagen
        images: this.imageBlobs, // Enviar blobs de imágenes en lugar de base64
        imageNames: this.imageNames  
      });
    } else {
      alert('Por favor, ingrese una descripción y suba exactamente 2 imágenes.');
    }
  }

  // Cancelar acción
  onCancel() {
    this.cancel.emit();
  }
}
