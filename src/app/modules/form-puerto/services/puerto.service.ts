import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment'; 
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PuertoService {

  private baseUrl: string;

  constructor(
    private http: HttpClient
  ) {
      this.baseUrl = environment.API_URL;
    }

  getRegistroFormPuerto() {
    return this.http.get<any[]>(`${this.baseUrl}getRegistroFormPuerto`);
  }

  getInformePuertoByID(idInforme: number) {
    return this.http.get<any>(`${this.baseUrl}getInformePuertoByID/${idInforme}`);
  }

  getItemPuertoByIdInforme(idInforme: number) {
    return this.http.get<any>(`${this.baseUrl}getItemPuertoByIdInforme/${idInforme}`);
  }

  getDetallePuerto() {
    return this.http.get<any[]>(`${this.baseUrl}getDetallePuerto`);
  }

  getStatusPuerto() {
    return this.http.get<any[]>(`${this.baseUrl}getStatusPuerto`);
  }

  getNombreFormPuerto() {
    return this.http.get<any[]>(`${this.baseUrl}getNombreFormPuerto`);
  }

  getdescripcionPuertoByIdInforme(idInforme: number) {
    return this.http.get<any[]>(`${this.baseUrl}getdescripcionPuertoByIdInforme/${idInforme}`);
  }

  getFotoByIdInformePuerto(idInforme: number) {
    return this.http.get<any>(`${this.baseUrl}getFotoByIdInformePuerto/${idInforme}`);
  }

  getformEPuertoByIdInforme(idInforme: number) {
    return this.http.get<any>(`${this.baseUrl}getformEPuertoByIdInforme/${idInforme}`);
  }

  getformE1PuertoByIdInforme(idInforme: number) {
    return this.http.get<any[]>(`${this.baseUrl}getformE1PuertoByIdInforme/${idInforme}`);
  }

  getSetFotograficoByIdInformePuerto(idInforme: number) {
    return this.http.get<any>(`${this.baseUrl}getSetFotograficoByIdInformePuerto/${idInforme}`);
  }

  editInformePuerto(data: any) {
    return this.http.put<any>(`${this.baseUrl}editInformePuerto`, data);
  }

  editItemPuerto(data: any) {
    return this.http.put<any>(`${this.baseUrl}editItemPuerto`, data);
  }

  editDescripcionPuerto(data: any) {
    return this.http.put<any>(`${this.baseUrl}editDescripcionPuerto`, data);
  }

  sendFotosPuerto(data: any) {
    return this.http.post<any>(`${this.baseUrl}sendFotosPuerto`, data);
  }

  postDescripcionPuerto(data: any) {
    return this.http.post<any>(`${this.baseUrl}sendDescripcionPuerto`, data);
  }

  deleteDescripcionPuerto(data: any) {
    return this.http.request<any>('delete', `${this.baseUrl}deleteDescripcionPuerto`, { body: data });
  }

  deleteFotoPuertoByIdDetalle(data: any) {
    return this.http.request<any>('delete', `${this.baseUrl}deleteFotoPuertoByIdDetalle`, { body: data });
  }
}
