import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor() {}

  async generatePDF(contentToConvert: string) {
    const content = document.getElementById(contentToConvert);

    if (content) {
      // Usa html2canvas para capturar el contenido como una imagen
      const canvas = await html2canvas(content);

      // Obtener la imagen en formato dataURL
      const imgData = canvas.toDataURL('image/png');

      // Crear un nuevo documento PDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Calcular las dimensiones para la imagen
      const imgWidth = 210; // Ancho de la página A4 en mm
      const pageHeight = 297; // Alto de la página A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Ajusta la altura de la imagen manteniendo la proporción

      let heightLeft = imgHeight;
      let position = 0;

      // Agregar la imagen al PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Si el contenido excede una página, agregar páginas adicionales
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Guardar el PDF generado
      pdf.save('document.pdf');
    }
  }
}
