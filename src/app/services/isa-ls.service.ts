import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Cardex } from '../models/cardex';
import { Productos } from '../models/productos';

@Injectable({
  providedIn: 'root'
})
export class IsaLSService {

  constructor( private storage: Storage ) {
    this.crearBD();
  }

  guardarHistVentas( cardex: Cardex[] ){
    this.storage.set( 'HistVentas', cardex );
  }

  guardarSKUS( productos: Productos[] ){
    this.storage.set( 'Productos', productos );
  }

  async getHistVentas(){
    let cardex: Cardex[] = [];

    const histVentas = await this.storage.get( 'HistVentas' );
    cardex = histVentas;
    return cardex;
  }

  async getSKUS(){
    let productos: Productos[] = [];

    const prod = await this.storage.get( 'Productos' );
    productos = prod;
    return productos;
  }

  async crearBD(){
    await this.storage.create();
  }

}
