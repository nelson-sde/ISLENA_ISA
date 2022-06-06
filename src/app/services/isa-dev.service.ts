import { Injectable } from '@angular/core';
import { LineasDev, Devolucion, DevolucionFR } from '../models/devolucion';
import { IsaService } from './isa.service';

@Injectable({
  providedIn: 'root'
})
export class IsaDevService {

  devolucionDet: LineasDev[] = [];
  sinSalvar: boolean = false;

  constructor( private isa: IsaService ) { 
    this.devolucionDet = [];
    this.sinSalvar = false;
  }

  guardarDevoluciones( devoluciones: Devolucion[] ){
    let devolucionesBD: Devolucion[] = [];

    devolucionesBD = JSON.parse(localStorage.getItem('ISADev')!) || [];
    const arrayDev = devolucionesBD.concat(devoluciones);
    localStorage.setItem('ISADev', JSON.stringify(arrayDev));
  }

  transmitirDev( devoluciones: Devolucion[] ){
    let devFR: DevolucionFR[] = []
    let item:  DevolucionFR
    let l:     number = 1

    devoluciones.forEach( x => {
      item = new DevolucionFR( x.numDevolucion, l, 'ISLENA', this.isa.varConfig.numRuta, x.cliente, x.fecha, x.fechaFin, x.fecha, x.comentarios, x.lineas.length + 1,
                  x.listaPrecios, x.montoSinIVA, x.montoDesc, 0, x.montoImp, 0, x.bodega, x.numFactura, x.nivelPrecios, x.moneda, x.codGeo1, x.codGeo2,
                  '01', x.actividadCo, null, null, 0, 0, 0, null, null, null, 0, 0, 0, null, null)
      devFR.push( item );

      x.lineas.forEach( y => {
        l += 1;
        item = new DevolucionFR( x.numDevolucion, l, 'ISLENA', this.isa.varConfig.numRuta, x.cliente, null, null, null, null, null, x.listaPrecios, 
                  null, null, null, null, null, null, null, null, null, null, null, null, null, y.articulo, 'B', y.montoLinea, y.precio, y.cantidadDev, '0',
                  y.tipoImp, y.tipoTarifa, 0, 0, y.porcenIVA, 'N', 'N')
        devFR.push( item );
      })
      l = 1;
    })
  }

}
