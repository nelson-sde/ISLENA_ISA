import { Injectable } from '@angular/core';
import { Cardex } from '../models/cardex';

@Injectable({
  providedIn: 'root'
})
export class IsaCardexService {

  cardex: Cardex[] = [];
  cardexBD: Cardex[] = [];

  constructor() {}

  agregarCardex(data: Cardex){
    this.cardex.push(data);
  }

  guardarCardex(){
    if (localStorage.getItem('cardex')){
      this.cardexBD = JSON.parse( localStorage.getItem('cardex'));
    }
    localStorage.setItem('cardex', JSON.stringify(this.cardexBD.concat(this.cardex)));
  }

}
