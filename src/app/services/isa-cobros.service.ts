import { Injectable } from '@angular/core';
import { Pen_Cobro } from '../models/cobro';

@Injectable({
  providedIn: 'root'
})
export class IsaCobrosService {
  
  cxc: Pen_Cobro[] = [];

  constructor() { }

  cargarCxC( codCliente: number ){
    let c: Pen_Cobro[] = [];

    if (localStorage.getItem('cxc')){
      c = JSON.parse(localStorage.getItem('cxc'));
      this.cxc = c.filter( d => d.codCliente == codCliente && d.tipoDocumen == '1' );
      if ( this.cxc.length > 0 ){
        c = this.cxc.slice(0);
        this.cxc = c.sort((a,b) => new Date(a.fechaDoc).getTime() - new Date(b.fechaDoc).getTime());
      }
    }
  }

}
