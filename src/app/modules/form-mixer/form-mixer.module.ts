import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormMixerComponent } from './form-mixer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    FormMixerComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
  ],
  exports: [
    FormMixerComponent,
  ]
})
export class FormMixerModule { }
