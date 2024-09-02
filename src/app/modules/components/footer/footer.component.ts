import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  footerdatos = ['Preparado por', 'Hector Contresas C.', 'Revisado y aprobado por', 'Enrique Pizarro B.', 'Informe N°',
     'GRC-2311-0441 C', 'Formulario', 'FT_GRU2_01 Grúas Puente o pórtico', 'Versión # 07 - 01.06.2020']

  constructor() { }

 ngOnInit() {

 }

}
