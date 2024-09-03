import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { InfoMessageComponent } from '../components/info-message/info-message.component';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    InfoMessageComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    InfoMessageComponent
  ]
})
export class SharedModule { }
