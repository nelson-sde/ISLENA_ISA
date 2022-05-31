import { Injectable } from '@angular/core';
import { LineasDev } from '../models/devolucion';

@Injectable({
  providedIn: 'root'
})
export class IsaDevService {

  devolucionDet: LineasDev[] = [];
  sinSalvar: boolean = false;

  constructor() { 
    this.devolucionDet = [];
    this.sinSalvar = false;
  }
}
