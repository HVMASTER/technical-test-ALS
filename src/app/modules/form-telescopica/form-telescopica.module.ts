import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormTelescopicaComponent } from './form-telescopica.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    FormTelescopicaComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
  ],
  exports: [
    FormTelescopicaComponent
  ]
})
export class FormTelescopicaModule { }
