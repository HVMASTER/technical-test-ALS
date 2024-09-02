import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment'; 
import { Informe } from '../interfaces/informe.interface';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  private baseUrl: string;

  constructor(
    private http: HttpClient
  ) {
      this.baseUrl = environment.API_URL;
    }

  getRegistroFormPuente() {
    return this.http.get<Informe[]>(`${this.baseUrl}getRegistroFormPuente`);
  }

  getInformePuenteByID(idInforme: number) {
    return this.http.get<Informe>(`${this.baseUrl}getInformePuenteByID/${idInforme}`);
  }

  getItemPuenteByIdInforme(idInforme: number) {
    return this.http.get<any>(`${this.baseUrl}getItemPuenteByIdInforme/${idInforme}`);
  }

  getDetalle() {
    return this.http.get<any[]>(`${this.baseUrl}getDetalle`);
  }

  getStatus() {
    return this.http.get<any[]>(`${this.baseUrl}getStatus`);
  }

  getdescripcionPuenteByIdInforme(idInforme: number) {
    return this.http.get<any[]>(`${this.baseUrl}getdescripcionPuenteByIdInforme/${idInforme}`);
  }

  getformHPuenteByIdInforme(idInforme: number) {
    return this.http.get<any>(`${this.baseUrl}getformHPuenteByIdInforme/${idInforme}`);
  }

  getformH1PuenteByIdInforme(idInforme: number) {
    return this.http.get<any[]>(`${this.baseUrl}getformH1PuenteByIdInforme/${idInforme}`);
  }

  getformH2PuenteByIdInforme(idInforme: number) {
    return this.http.get<any>(`${this.baseUrl}getformH2PuenteByIdInforme/${idInforme}`);
  }

  getSetFotograficoByIdInforme(idInforme: number) {
    return this.http.get<any>(`${this.baseUrl}getSetFotograficoByIdInforme/${idInforme}`);
  }

  getNombreForm() {
    return this.http.get<any[]>(`${this.baseUrl}getNombreForm`);
  }

  editInformePuente(informeData: any) {
    return this.http.put(`${this.baseUrl}editInformePuente`, informeData);
  }

  editItemPuente(itemData: any) {
    return this.http.put(`${this.baseUrl}editItemPuente`, itemData);
  }

  editDescripcionPuente(itemData: any) {
    return this.http.put(`${this.baseUrl}editDescripcionPuente`, itemData);
  }

  editFormHPuente(idInforme: number, formHData: any) {
    return this.http.put(`${this.baseUrl}editFormHPuente/${idInforme}`, formHData);
  } 
}
