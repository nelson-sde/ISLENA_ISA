import { Injectable } from '@angular/core';
import { LineasDev, Devolucion, DevolucionFR } from '../models/devolucion';
import { IsaService } from './isa.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Email } from '../models/email';
import { Cliente } from '../models/cliente';

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

    const fechaDev = new Date(new Date(devoluciones[0].fecha).getTime() - (new Date(devoluciones[0].fecha).getTimezoneOffset() * 60000));
    const fechaFin = new Date(new Date(devoluciones[0].fechaFin).getTime() - (new Date(devoluciones[0].fechaFin).getTimezoneOffset() * 60000));

    devoluciones.forEach( x => {
      // porcenDesc = x.montoDesc * 100 / x.montoSinIVA;
      item = new DevolucionFR( x.numDevolucion, l, 'ISLENA', this.isa.varConfig.numRuta, x.cliente, fechaDev, fechaFin, fechaDev, x.comentarios, x.lineas.length,
                  x.listaPrecios, x.montoSinIVA, x.montoDesc, x.porcenDesc, x.montoImp, 0, x.bodega, x.numFactura, x.nivelPrecios, x.moneda, x.codGeo1, x.codGeo2,
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
        this.enviarEmails( devoluciones );
        this.isa.presentaToast('Devolución registrada con Exito...');
      }, error => {
        console.log('ERROR INSERTANDO DEVOLUCIONES.', error.message)
        this.isa.presentaToast('ERROR TRANSMITIENDO LAS DEVOLUCIONES...!!!');
      }
    )
  }

  enviarEmails( devoluciones: Devolucion[] ){
    let email:  Email
    let cliente: Cliente

    devoluciones.forEach( x => {
      cliente = this.isa.clientes.find( y => y.id === x.cliente );
      if ( cliente ){ 
        email = new Email( cliente.email, `DEVOLUCIÓN DE MERCADERÍA ${x.numDevolucion}`, this.getBody( x, cliente));
        this.isa.enviarEmail( email );
        email.toEmail = this.isa.varConfig.emailVendedor;
        this.isa.enviarEmail( email );
      }
    });
  }

  getBody ( devolucion: Devolucion, cliente: Cliente, numRecibo: boolean = true, nulo: boolean = false ){
    let body: string[] = [];
    let day = new Date(devolucion.fecha).getDate();
    let month = new Date(devolucion.fecha).getMonth()+1;
    let year = new Date(devolucion.fecha).getFullYear();
    let subTotal: number = 0;
    const etiqueta = 'DEVOLICIÓN DE MERCADERÍA';

    body.push(`<TABLE BORDER  CELLPADDING=5 CELLSPACING=0>`);
    body.push(`<Tr><Th ROWSPAN=2><img src="https://di.cr/image/catalog/logotipo_front_home1.png"  width="227" height="70"></Th><Th ROWSPAN=2>Distribuidora Isleña de Alimentos S.A.<Br>Cédula Juridica 3-101-109180</Th><Th>${etiqueta}</Th></Tr>`);
    
    body.push(`<Tr><Td ALIGN=center><font color="red">${devolucion.numDevolucion}</font></Td></Tr>`);
    
    if ( nulo ){ 
      body.push(`<Tr><Td ALIGN=center COLSPAN=2><font color="red">**** NULO ****</font></Td><Td ALIGN=right>Fecha: ${day} - ${month} - ${year}</Td></Tr>`);
    } else {
      body.push(`<Tr><Td ALIGN=left COLSPAN=2><strong>Factura Ref: ${devolucion.numFactura}</strong></Td><Td ALIGN=center>Fecha: ${day} - ${month} - ${year}</Td></Tr>`);
    }
    body.push(`<Tr><Td ALIGN=left COLSPAN=2>Cliente: ${cliente.nombre}</Td><Td ALIGN=center>Código: ${devolucion.cliente}</Td></Tr>`);
    body.push(`<Tr><Td ALIGN=left COLSPAN=2>Dirección: ${cliente.direccion}</Td><Td ALIGN=center>Ruta: ${this.isa.varConfig.numRuta}</Td></Tr>`);
    body.push(`</TABLE>`);  
    body.push(`<br>`);

    body.push(`<TABLE BORDER  CELLPADDING=5 CELLSPACING=0>`);
    body.push(`<Tr><Td ALIGN=center>PRODUCTO</Td><Td ALIGN=center>CODIGO</Td><Td ALIGN=center>DESCUENTO</Td><Td ALIGN=center>UNIDADES</Td><Td ALIGN=center>MONTO</Td></Tr>`);

    devolucion.lineas.forEach( x => {
      body.push(`<Tr><Td ALIGN=left>${x.descripcion}</Td><Td ALIGN=left>${x.articulo}</Td><Td ALIGN=center>${x.descPorcen}%</Td><Td ALIGN=center>${x.cantidadDev}</Td><Td ALIGN=right>${this.colones(x.montoLinea - x.montoDesc)}</Td></Tr>`);
      subTotal += x.montoLinea - x.montoDesc;
    });
    body.push(`<Tr><Td ALIGN=right COLSPAN=4>Sub Total:</Td><Td ALIGN=right>${this.colones(subTotal)}</Td></Tr>`);
    body.push(`<Tr><Td ALIGN=right COLSPAN=4>Descuento General:</Td><Td ALIGN=right>${this.colones(devolucion.montoDesc)}</Td></Tr>`);
    body.push(`<Tr><Td ALIGN=right COLSPAN=4>TOTAL:</Td><Td ALIGN=right>${this.colones(subTotal - devolucion.montoDesc)}</Td></Tr>`);
    body.push(`</TABLE>`);  
    body.push(`<br>`);
    /*
    body.push(`RECIBIMOS DE: ${nombre}.<br>`);
    body.push(`<br>`);
    body.push(`Código: ${recibo.codCliente} LA SUMA DE: ${this.colones(recibo.montoLocal)} colones.<br>`);
    body.push(`<br>`);
    
    recibo.detalle.forEach( d => {
      texto = texto.concat(`, ${d.numeroDocumen}`);
      saldoAnterior += d.montoLocal;
      saldoActual += d.saldoLocal; 
    });
    saldoAnterior = saldoActual + recibo.montoLocal;
    body.push(`POR CONCEPTO DE: Abono a Factura${texto}. ${recibo.observaciones}`);
    body.push(`<br>`);
    body.push(`<br>`);

    if (recibo.montoEfectivoL > 0){
      efectivo = 'X';
    }
    if (recibo.montoChequeL > 0){
      hayCheque = 'X';
    }
    const saldo = saldoActual - recibo.monto_NC - recibo.otrosMov;

    body.push(`[${efectivo}] Efectivo   [${hayCheque}] Cheque No. ${cheque.numeroCheque}, Banco: ${cheque.codigoBanco}<br>`);
    body.push(`<br>`);
    body.push(`<TABLE BORDER  CELLPADDING=5 CELLSPACING=0>`);
    body.push(`<Tr><Td>Saldo Anterior: </Td><Td ALIGN=right>${this.colones(saldoAnterior)}</Td></Tr>`);
    body.push(`<Tr><Td>Este abono: </Td><Td ALIGN=right>${this.colones(recibo.montoLocal)}</Td></Tr>`);
    body.push(`<Tr><Td>Saldo Actual: </Td><Td ALIGN=right>${this.colones(saldoActual)}</Td></Tr>`);
    body.push(`<Tr><Td>Notas Crédito: - </Td><Td ALIGN=right>${this.colones(recibo.monto_NC)}</Td></Tr>`);
    body.push(`<Tr><Td>Otros Cargos: - </Td><Td ALIGN=right>${this.colones(recibo.otrosMov)}</Td></Tr>`);
    body.push(`<Tr><Td>Saldo: </Td><Td ALIGN=right>${this.colones(saldo)}</Td></Tr>`);
    body.push(`</TABLE>`);
    body.push(`<br>`);
    if ( recibo.tipoDoc === 'T'){
      body.push(`Nota: La validez de esta transacción queda sujeta a qué se compruebe la confirmación de los fondos en nuestras cuentas bancarias.<br>`);
    } else {
      body.push(`Nota: La validez de este recibo queda sujeta a que el banco honre su cheque.<br>`);
    }
    */
    body.push(`<br>`);
    body.push(`Atentamente<br/>`);
    body.push(`Departamento de Crédito y Cobro.<br>`);
    body.push(`Distribuidora Isleña de Alimentos S.A.<br>`);
    body.push(`Barreal de Heredia, de la Embotelladora Pepsi 100m Este, 500m Norte.<br>`);
    body.push(`Tel: (506)2293-0609 - Fax: (506)2293-3231. Apdo: 463-1200 Pavas.<br>`);
    body.push(`www.distribuidoraislena.com<br>`);

    return body.join('');
  }

  colones (amount, decimalCount = 2, decimal = ".", thousands = ","){
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
    const negativeSign = amount < 0 ? "-" : "";
    let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
    let j = (i.length > 3) ? i.length % 3 : 0;
    return negativeSign + '¢' + (j ? i.substr(0, j) + thousands : '') + 
      i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + 
      (decimalCount ? decimal + Math.abs(amount - Number(i)).toFixed(decimalCount).slice(2) : "");
  }

}
