import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormService } from './services/form.service';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
  numeroInformes: string[] = [];
  informes: any[] = [];

  constructor(
    private formService: FormService,
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getNumeroInformes();
    //this.getInformeById(2);
    //this.getInformeByNumero("GRC-2311-0441");
  }

  getNumeroInformes(): void {
    this.formService.getInformesPuente().pipe(
      tap((data: any[]) => {
        data.forEach((informe) => {
          this.numeroInformes.push(informe.numeroInforme);
          this._cdr.markForCheck();
        });
        console.log('Informes: ' + this.numeroInformes);
      })
    ).subscribe({
      error: (error) => {
        console.log('Error: ' + error);
      }
    });
  }

  getInformeById(idInforme: number): void {
    this.formService.getInformesPuenteById(idInforme).pipe(
      filter((data: any) => data !== null),
      switchMap((data: any) => {
        console.log('Informe: ' + data);
        return data;
      })
    ).subscribe({
      error: (error) => {
        console.log('Error: ' + error);
      }
    });
  }

  getInformeByNumero(numeroInforme: string): void {
    this.formService.getInformesPuente().pipe(
      tap((data: any[]) => {
      data.filter((informe) => informe.numeroInforme === numeroInforme);
      this._cdr.markForCheck();
      console.log('Informe: ' + data);
      })
    ).subscribe({
      error: (error) => {
        console.log('Error: ' + error);
      }
    });
  }
}
