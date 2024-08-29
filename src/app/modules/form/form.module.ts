import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormComponent } from './form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '../form/components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';




@NgModule({
  declarations: [
    FormComponent,
    HeaderComponent,
    FooterComponent
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
