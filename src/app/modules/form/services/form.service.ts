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

  getInformesPuente() {
    return this.http.get<Informe[]>(`${this.baseUrl}getInformesPuente`);
  }

  getInformesPuenteById(idInforme: number) {
    return this.http.get<Informe>(`${this.baseUrl}getInformePuenteByID/${idInforme}`);
  }
}
