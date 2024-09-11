import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TelescopicaService {

  private baseUrl: string;

  constructor(
    private http: HttpClient
  ) {
      this.baseUrl = environment.API_URL;
    }

  getRegistroFormTelescopica() {
    return this.http.get<any[]>(`${this.baseUrl}getRegistroFormTelescopica`);
  }

  getInformeTelescopicaByID(idInforme: number) {
    return this.http.get<any>(`${this.baseUrl}getInformeTelescopicaByID/${idInforme}`);
  }

  getItemTelescopicaByIdInforme(idInforme: number) {
    return this.http.get<any>(`${this.baseUrl}getItemTelescopicaByIdInforme/${idInforme}`);
  }

  getDetalleTelescopica() {
    return this.http.get<any[]>(`${this.baseUrl}getDetalleTelescopica`);
  }

  getStatusTelescopica() {
    return this.http.get<any[]>(`${this.baseUrl}getStatusTelescopica`);
  }

  getNombreFormTelescopica() {
    return this.http.get<any[]>(`${this.baseUrl}getNombreFormTelescopica`);
  }

  getdescripcionTelescopicaByIdInforme(idInforme: number) {
    return this.http.get<any[]>(`${this.baseUrl}getdescripcionTelescopicaByIdInforme/${idInforme}`);
  }

  getFotoByIdInformeTelescopica(idInforme: number) {
    return this.http.get<any>(`${this.baseUrl}getFotoByIdInformeTelescopica/${idInforme}`);
  }

  getformHTelescopicaByIdInforme(idInforme: number) {
    return this.http.get<any>(`${this.baseUrl}getformHTelescopicaByIdInforme/${idInforme}`);
  }

  getformH1TelescopicaByIdInforme(idInforme: number) {
    return this.http.get<any[]>(`${this.baseUrl}getformH1TelescopicaByIdInforme/${idInforme}`);
  }

  getformH2TelescopicaByIdInforme(idInforme: number) {
    return this.http.get<any>(`${this.baseUrl}getformH2TelescopicaByIdInforme/${idInforme}`);
  }

  getSetFotograficoByIdInformeTelescopica(idInforme: number) {
    return this.http.get<any>(`${this.baseUrl}getSetFotograficoByIdInformeTelescopica/${idInforme}`);
  }

  editInformeTelescopicas(data: any) {
    return this.http.put<any>(`${this.baseUrl}editInformeTelescopicas`, data);
  }

  editItemTelescopica(data: any) {
    return this.http.put<any>(`${this.baseUrl}editItemTelescopicas`, data);
  }
}
