import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Cardex } from '../models/cardex';
import { Existencias } from '../models/pedido';
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

  guardarExistencias( arr: Existencias[] ){
    this.storage.set( 'Existencias', arr );
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

  async getExistencias(){
    let existencias: Existencias[] = [];

    const item = await this.storage.get( 'Existencias' );
    existencias = item;
    return existencias;
  }

  async crearBD(){
    await this.storage.create();
  }

}
