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
      const pages = content.querySelectorAll('.page');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Ancho de la página A4 en mm
      const pageHeight = 297; // Alto de la página A4 en mm
      const headerHeight = 40; // Altura del header
      const footerHeight = 30; // Altura del footer

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;

        // Capturar la página actual como imagen
        const canvas = await html2canvas(page);
        const imgData = canvas.toDataURL('image/png');
        let imgHeight = (canvas.height * imgWidth) / canvas.width;
        let yOffset = headerHeight; // Inicialmente después del header

        // Aplicar ajustes específicos según la página
        if (i >= 0 && i < 5) {
          // Aumentar ligeramente el tamaño del contenido en las páginas 1-5
          imgHeight *= 1.2; // Escalado 
        } else if (i === 5) {
          // Centrar el contenido en la página 6
          yOffset = (pageHeight - imgHeight) / 2;
        }

        if (i > 0) {
          pdf.addPage();
        }

        // Capturar y agregar el header
        const headerElement = document.querySelector('.header') as HTMLElement;
        const headerCanvas = await html2canvas(headerElement, { scale: 2 });
        const headerData = headerCanvas.toDataURL('image/png');
        pdf.addImage(headerData, 'PNG', 0, 0, imgWidth, headerHeight);

        // Agregar el contenido ajustado
        pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);

        // Capturar y agregar el footer
        const footerElement = document.querySelector('.footer') as HTMLElement;
        const footerCanvas = await html2canvas(footerElement, { scale: 2 });
        const footerData = footerCanvas.toDataURL('image/png');
        pdf.addImage(footerData, 'PNG', 0, pageHeight - footerHeight, imgWidth, footerHeight);
      }

      // Guardar el PDF generado
      pdf.save('document.pdf');
    }
  }
}
