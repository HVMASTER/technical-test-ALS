import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formulario-selector',
  templateUrl: './formulario-selector.component.html',
  styleUrls: ['./formulario-selector.component.scss']
})
export class FormularioSelectorComponent {

  // Lista de tipos de formularios
  tiposFormularios = [
    { nombre: 'Formulario Puente', ruta: 'puente' },
    { nombre: 'Formulario Mixer', ruta: 'mixer' },
    { nombre: 'Formulario Telescopica', ruta: 'telescopica' }
  ];

  constructor(private router: Router) {}

  // Método para manejar la selección de un tipo de formulario
  seleccionarFormulario(tipo: string) {
    this.router.navigate([`/${tipo}`]);
  }
}