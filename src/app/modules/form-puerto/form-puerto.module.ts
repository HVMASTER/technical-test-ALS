import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { FormPuertoComponent } from './form-puerto.component';



@NgModule({
  declarations: [
    FormPuertoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
  ],
  exports: [
    FormPuertoComponent
  ],
})
export class FormPuertoModule { }
