import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormularioSelectorComponent } from './modules/formulario-selector/formulario-selector.component';
import { FormComponent } from './modules/form/form.component';
import { FormMixerComponent } from './modules/form-mixer/form-mixer.component';
import { FormTelescopicaComponent } from './modules/form-telescopica/form-telescopica.component';

const routes: Routes = [
  { path: '', component: FormularioSelectorComponent }, // Ruta por defecto
  { path: 'puente', component: FormComponent },
  { path: 'mixer', component: FormMixerComponent },
  { path: 'telescopica', component: FormTelescopicaComponent },
  { path: '**', redirectTo: '' } // Redireccionar cualquier ruta no existente a la selección de formulario
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
