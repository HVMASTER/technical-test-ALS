import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { DatePipe } from '@angular/common';
import { AppComponent } from './app.component';
import { FormModule } from './modules/form/form.module';
import { FormMixerModule } from './modules/form-mixer/form-mixer.module';
import { FormularioSelectorComponent } from './modules/formulario-selector/formulario-selector.component';
import { ReportModalComponentComponent } from './modules/components/report-modal-component/report-modal-component.component';

@NgModule({
  declarations: [
    AppComponent,
    FormularioSelectorComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormModule,
    FormMixerModule,
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
