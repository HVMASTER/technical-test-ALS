import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { InfoMessageComponent } from '../components/info-message/info-message.component';
import { ReportModalComponentComponent } from '../components/report-modal-component/report-modal-component.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    InfoMessageComponent,
    ReportModalComponentComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    InfoMessageComponent,
    ReportModalComponentComponent
  ]
})
export class SharedModule { }
