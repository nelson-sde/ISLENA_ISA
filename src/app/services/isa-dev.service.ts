import { Injectable } from '@angular/core';
import { DevolucionesDet } from '../models/cardex';

@Injectable({
  providedIn: 'root'
})
export class IsaDevService {

  devolucionDet: DevolucionesDet[] = [];
  sinSalvar: boolean = false;

  constructor() { 
    this.devolucionDet = [];
    this.sinSalvar = false;
  }
}
