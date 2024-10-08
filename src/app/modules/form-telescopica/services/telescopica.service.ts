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
    return this.http.get<any>(`${this.baseUrl}getFotoByIdInformeTelescopicas/${idInforme}`);
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

  editDescripcionTelescopica(data: any) {
    return this.http.put<any>(`${this.baseUrl}editDescripcionTelescopicas`, data);
  }

  editFormHTelescopica(data: any) {
    return this.http.put<any>(`${this.baseUrl}editFormHTelescopicas`, data);
  }

  editFormH1Telescopica(data: any) {
    return this.http.put<any>(`${this.baseUrl}editFormH1Telescopicas`, data);
  }

  editFormH2Telescopica(data: any) {
    return this.http.put<any>(`${this.baseUrl}editFormH2Telescopicas`, data);
  }

  postDescripcionTelescopica(data: any) {
    return this.http.post<any>(`${this.baseUrl}sendDescripcionTelescopica`, data);
  }

  sendFotosTelescopica(data: any) {
    return this.http.post<any>(`${this.baseUrl}sendFotosTelescopica`, data);
  }

  deleteFotoTelescopica(data: any) {
    return this.http.request<any>('delete',`${this.baseUrl}deleteFotoTelescopicas`, { body: data });
  }

  deleteDescripcionTelescopica(data: any) {
    return this.http.request<any>('delete',`${this.baseUrl}deleteDescripcionTelescopicas`, { body: data });
  }

  deleteFotoTelescopicasByIdDetalle(data: any) {
    return this.http.request<any>('delete',`${this.baseUrl}deleteFotoTelescopicasByIdDetalle`, { body: data });
  }
}
