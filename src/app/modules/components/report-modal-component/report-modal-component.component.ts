import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MixerService } from '../../form-mixer/services/mixer.service';

@Component({
  selector: 'app-report-modal-component',
  templateUrl: './report-modal-component.component.html',
  styleUrl: './report-modal-component.component.scss',
})
export class ReportModalComponentComponent {
  @Input() idInforme!: any;
  @Input() idDetalle!: any;
  @Input() idStatus!: any;
  @Input() numeroInforme!: string;
  @Input() allowImages: boolean = true; // Permite controlar si se permiten imágenes

  @Output() save = new EventEmitter<{
    description: string;
    images: string[];
    imagesNames: any[];
  }>();
  @Output() cancel = new EventEmitter<void>();

  description: string = '';
  images: any[] = []; // Para mostrar las imágenes en base64 en el frontend
  imageBlobs: Blob[] = []; // Para almacenar las imágenes en formato Blob para el backend
  imageNames: any[] = [];

  constructor(private mixerService: MixerService) {}

  // Propiedad para habilitar/deshabilitar el botón de guardar
  get canSave(): boolean {
    return this.description.trim().length > 0 && this.images.length == 2;
  }

  // Manejo de archivos seleccionados
  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.imageNames.push(file.name);

      // Convertimos el archivo a base64 para la visualización en el frontend
      const base64Image = await this.convertBlobToBase64(file);
      this.images.push(base64Image); // Guardamos la imagen en base64 para mostrarla

      // Guardamos el BLOB para enviarlo al backend
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
    this.images.splice(index, 1); // Eliminamos la imagen en base64
    this.imageBlobs.splice(index, 1); // Eliminamos el BLOB
    this.imageNames.splice(index, 1); // Eliminamos también el nombre
  }

  // Guardar datos del modal
  onSave() {
    if (this.description && this.images.length >= 2) {
      const formData = new FormData();

      // Asegurar que los datos obligatorios están presentes
      if (
        !this.idInforme ||
        !this.numeroInforme ||
        !this.idDetalle ||
        !this.idStatus
      ) {
        console.error(
          'Los parámetros idInforme, numeroInforme, idDetalle e idStatus son requeridos.'
        );
        return;
      }

      console.log('Descripción:', this.description);
      console.log('Imágenes (Blob):', this.imageBlobs);
      console.log('Nombres de las imágenes:', this.imageNames);

      // Utilizamos imageBlobs para enviar las imágenes como BLOB
      this.imageBlobs.forEach((imageBlob, index) => {
        if (imageBlob) {
          formData.append('idInforme', this.idInforme);
          formData.append('numeroInforme', this.numeroInforme);
          formData.append('idDetalle', this.idDetalle);
          formData.append('idStatus', this.idStatus);

          formData.append('foto', this.imageNames[index]); // Agrega el nombre de la imagen
          formData.append('data', imageBlob); // Enviar la imagen en BLOB
          formData.append('numero', (index + 1).toString()); // Agregar el índice de la imagen como número

          console.log(`Imagen ${index}:`, {
            nombre: this.imageNames[index],
            Blob: imageBlob,
          });

          // Llamada al servicio para enviar las imágenes como BLOB
          this.mixerService.sendFotosMixer(formData).subscribe({
            next: (response) => {
              console.log('fotos subidas correctamente: ', this.imageBlobs);
              console.log(`Imagen ${index + 1} subida correctamente.`);
              console.log('Imagen(es) subidas correctamente.');

              // Emitir el evento de guardar en el modal
              this.save.emit({
                description: this.description,
                images: this.images, // imágenes en base64 para el frontend
                imagesNames: this.imageNames, // nombres de las imágenes
              });
            },
            error: (error) => {
              console.error('Error subiendo imagen(es):', error);
            },
          });
        }
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
