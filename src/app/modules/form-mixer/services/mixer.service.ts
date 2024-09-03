import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment'; 
@Injectable({
  providedIn: 'root'
})
export class MixerService {

  private baseUrl: string;

  constructor(
    private http: HttpClient
  ) {
      this.baseUrl = environment.API_URL;
    }

  getRegistroFormMixer() {
    return this.http.get<any[]>(`${this.baseUrl}getRegistroFormMixer`);
  }

  getInformeMixerByID(idInforme: number) {
    return this.http.get<any>(`${this.baseUrl}getInformeMixerByID/${idInforme}`);
  }

  getItemMixerByIdInforme(idInforme: number) {
    return this.http.get<any[]>(`${this.baseUrl}getItemMixerByIdInforme/${idInforme}`);
  }

  getDetalleMixer() {
    return this.http.get<any[]>(`${this.baseUrl}getDetalleMixer`);
  }

  getStatusMixer() {
    return this.http.get<any[]>(`${this.baseUrl}getStatusMixer`);
  }

  getformBetoneraByIdInformeMixer(idInforme: number) {
    return this.http.get<any[]>(`${this.baseUrl}getformBetoneraByIdInformeMixer/${idInforme}`);
  }
}
