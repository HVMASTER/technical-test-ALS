import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormComponent } from './form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { InfoMessageComponent } from '../components/info-message/info-message.component';




@NgModule({
  declarations: [
    FormComponent,
    HeaderComponent,
    FooterComponent,
    InfoMessageComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  exports: [
    FormComponent,
    HeaderComponent
  ]
})
export class FormModule { }
