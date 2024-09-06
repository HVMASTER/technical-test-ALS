import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MixerService } from '../../form-mixer/services/mixer.service';

@Component({
  selector: 'app-report-modal-component',
  templateUrl: './report-modal-component.component.html',
  styleUrl: './report-modal-component.component.scss',
})
export class ReportModalComponentComponent {
  @Input() idInforme!: number; // Recibe el idInforme desde el componente principal
  @Input() idDetalle!: number; // Recibe el idDetalle desde el componente principal
  @Input() idStatus!: number; // Recibe el idStatus desde el componente principal
  @Input() numeroInforme!: string; // Recibe el número de informe desde el componente principal

  @Output() save = new EventEmitter<{
    description: string;
    images: string[];
  }>();
  @Output() cancel = new EventEmitter<void>();

  description: string = '';
  images: string[] = [];
  imageNames: string[] = [];

  constructor(private mixerService: MixerService) {}

  // Propiedad para habilitar/deshabilitar el botón de guardar
  get canSave(): boolean {
    return (
      this.description.trim().length > 0 &&
      this.images.length >= 2
    );
  }

  // Manejo de archivos seleccionados
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.imageNames.push(file.name); // Agregar nombre de la imagen
      this.convertToBase64(file);
    }
  }

  // Conversión de archivo a Base64
   convertToBase64(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.images.push(e.target.result); // Agregar la imagen convertida al array
    };
    reader.readAsDataURL(file);
  }

  // Eliminar imagen
  removeImage(index: number) {
    this.images.splice(index, 1); // Eliminamos la imagen
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
      console.log('Imágenes (Base64):', this.images);
      console.log('Nombres de las imágenes:', this.imageNames);

      // Filtrar imágenes no vacías antes de agregarlas al formData
      const validImages = this.images.filter((img) => img !== '');

      // crear objeto de imagen para enviar al servidor
      validImages.forEach((image, index) => {
        if (image) {
          formData.append('idInforme', this.idInforme.toString());
          formData.append('numeroInforme', this.numeroInforme);
          formData.append('idDetalle', this.idDetalle.toString());
          formData.append('idStatus', this.idStatus.toString());

          formData.append('foto', this.imageNames[index]); // Agrega el nombre de la imagen
          const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, ''); // Eliminar el prefijo Base64
          formData.append('data', base64Data); // Agrega la imagen en Base64
          formData.append('numero', index.toString()); // Agregar el índice de la imagen como número

          console.log(`Imagen ${index}:`, {
            nombre: this.imageNames[index],
            base64: base64Data,
          });

        }
      });

        // Verifica el contenido de formData
        formData.forEach((value, key) => {
          console.log(`FormData key: ${key}, value: ${value}`);
        });

      // Llamada al servicio para enviar las imágenes
      this.mixerService.sendFotosMixer(formData).subscribe({
        next: (response) => {
          console.log('Imagen(es) subidas correctamente.');

          // Emitir el evento de guardar en el modal
          this.save.emit({
            description: this.description,
            images: this.images,
          });
        },
        error: (error) => {
          console.error('Error subiendo imagen(es):', error);
        },
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
