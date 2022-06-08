import { Injectable } from '@angular/core';
import { LineasDev, Devolucion, DevolucionFR } from '../models/devolucion';
import { IsaService } from './isa.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IsaDevService {

  devolucionDet: LineasDev[] = [];
  sinSalvar: boolean = false;

  constructor( private isa: IsaService,
               private http: HttpClient ) { 
    this.devolucionDet = [];
    this.sinSalvar = false;
  }

  private postDevoluciones( dev: DevolucionFR[] ){
    const URL = this.isa.getURL( environment.DevURL, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    console.log('JSON', JSON.stringify(dev))
    return this.http.post( URL, JSON.stringify(dev), options );
  }

  guardarDevoluciones( devoluciones: Devolucion[] ){
    let devolucionesBD: Devolucion[] = [];

    devolucionesBD = JSON.parse(localStorage.getItem('ISADev')!) || [];
    const arrayDev = devolucionesBD.concat(devoluciones);
    localStorage.setItem('ISADev', JSON.stringify(arrayDev));
  }

  private actualizarDevoluciones( devoluciones: Devolucion[] ){
    let devolucionesBD: Devolucion[] = [];
    let i: number;

    devolucionesBD = JSON.parse(localStorage.getItem('ISADev')!) || [];
    devoluciones.forEach( x => {
      i = devolucionesBD.findIndex( a => a.numDevolucion === x.numDevolucion );
      if ( i >= 0 ){
        devolucionesBD[i].envioExitoso = true;
      }
    })
    localStorage.setItem('ISADev', JSON.stringify(devolucionesBD));
  }

  transmitirDev( devoluciones: Devolucion[] ){
    let devFR:      DevolucionFR[] = []
    let item:       DevolucionFR
    let l:          number = 1
    let porcenDesc: number

    const fechaDev = new Date(new Date(devoluciones[0].fecha).getTime() - (new Date(devoluciones[0].fecha).getTimezoneOffset() * 60000));
    const fechaFin = new Date(new Date(devoluciones[0].fechaFin).getTime() - (new Date(devoluciones[0].fechaFin).getTimezoneOffset() * 60000));

    devoluciones.forEach( x => {
      porcenDesc = x.montoDesc * 100 / x.montoSinIVA;
      item = new DevolucionFR( x.numDevolucion, l, 'ISLENA', this.isa.varConfig.numRuta, x.cliente, fechaDev, fechaFin, fechaDev, x.comentarios, x.lineas.length,
                  x.listaPrecios, x.montoSinIVA, x.montoDesc, porcenDesc, x.montoImp, 0, x.bodega, x.numFactura, x.nivelPrecios, x.moneda, x.codGeo1, x.codGeo2,
                  '01', x.actividadCo, null, null, 0, 0, 0, null, null, null, 0, 0, 0, null, null)
      devFR.push( item );

      x.lineas.forEach( y => {
        l += 1;
        item = new DevolucionFR( x.numDevolucion, l, 'ISLENA', this.isa.varConfig.numRuta, x.cliente, null, null, null, null, null, x.listaPrecios, 
                  null, y.montoDesc, y.descPorcen, null, null, null, null, null, null, null, null, null, null, y.articulo, 'B', y.montoLinea, y.precio, y.cantidadDev, '0',
                  y.tipoImp, y.tipoTarifa, 0, 0, y.porcenIVA, 'N', 'N')
        devFR.push( item );
      })
      l = 1;
    })

    this.postDevoluciones(devFR).subscribe(
      resp => {
        console.log('Devoluciones insertadas con Exito.')
        this.actualizarDevoluciones(devoluciones);
        this.isa.presentaToast('Devolución registrada con Exito...');
      }, error => {
        console.log('ERROR INSERTANDO DEVOLUCIONES.', error.message)
        this.isa.presentaToast('ERROR TRANSMITIENDO LAS DEVOLUCIONES...!!!');
      }
    )
  }

}
