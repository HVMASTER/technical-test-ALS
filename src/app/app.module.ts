import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { DatePipe } from '@angular/common';
import { AppComponent } from './app.component';
import { FormModule } from './modules/form/form.module';
import { FormMixerModule } from './modules/form-mixer/form-mixer.module';
import { FormTelescopicaModule } from './modules/form-telescopica/form-telescopica.module';
import { FormularioSelectorComponent } from './modules/formulario-selector/formulario-selector.component';

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
    FormTelescopicaModule
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
