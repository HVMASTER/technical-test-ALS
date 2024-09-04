import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class MixerService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.API_URL;
  }

  getRegistroFormMixer() {
    return this.http.get<any[]>(`${this.baseUrl}getRegistroFormMixer`);
  }

  getInformeMixerByID(idInforme: number) {
    return this.http.get<any>(
      `${this.baseUrl}getInformeMixerByID/${idInforme}`
    );
  }

  getItemMixerByIdInforme(idInforme: number) {
    return this.http.get<any[]>(
      `${this.baseUrl}getItemMixerByIdInforme/${idInforme}`
    );
  }

  getDetalleMixer() {
    return this.http.get<any[]>(`${this.baseUrl}getDetalleMixer`);
  }

  getStatusMixer() {
    return this.http.get<any[]>(`${this.baseUrl}getStatusMixer`);
  }

  getformBetoneraByIdInformeMixer(idInforme: number) {
    return this.http.get<any>(
      `${this.baseUrl}getformBetoneraByIdInformeMixer/${idInforme}`
    );
  }

  getdescripcionMixerByIdInforme(idInforme: number) {
    return this.http.get<any>(
      `${this.baseUrl}getdescripcionMixerByIdInforme/${idInforme}`
    );
  }

  getSetFotograficoByIdInformeMixer(idInforme: number) {
    return this.http.get<any>(
      `${this.baseUrl}getSetFotograficoByIdInformeMixer/${idInforme}`
    );
  }

  getformTorqueByIdInforme(idInforme: number) {
    return this.http.get<any>(
      `${this.baseUrl}getformTorqueByIdInforme/${idInforme}`
    );
  }

  getNombreFormMixer() {
    return this.http.get<any[]>(`${this.baseUrl}getNombreFormMixer`);
  }

  editInformeMixer(informeData: any) {
    return this.http.put<any>(`${this.baseUrl}editInformeMixer`, informeData);
  }

  editItemMixer(itemData: any) {
    return this.http.put<any>(`${this.baseUrl}editItemMixer`, itemData);
  }
}
