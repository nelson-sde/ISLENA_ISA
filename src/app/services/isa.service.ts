import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Cliente, ClienteBD } from '../models/cliente';
import { ClientesBD } from '../models/data-clientes';
import { DataProductos } from '../models/data-productos';
import { Productos } from '../models/productos';

export interface RutaConfig {
  numRuta: string;
  descripcion: string;
  codVendedor: number;
  nomVendedor: string;
  usuario: string;
  clave: string;
  consecutivoPedidos: number;
  consecutivoRecibos: number;
}

export interface Ruta {
  RUTA: string;
  HANDHELD: string;
  GRUPO_ARTICULO: string;
  COMPANIA: string;
  BODEGA: number;
  AGENTE: string;
  ID: string;
}

@Injectable({
  providedIn: 'root'
})
export class IsaService {

  varConfig: RutaConfig = {
    numRuta: 'R000',
    descripcion: 'No definido',
    codVendedor: 0,
    nomVendedor: 'No definido',
    usuario: 'admin',
    clave: 'admin',
    consecutivoPedidos: 0,
    consecutivoRecibos: 0,
  };

  clienteAct: Cliente;
  rutas: Ruta[] = [];
  productos: Productos[] = [];
  clientes: Cliente[] = [];
  buscarClientes: Cliente[] = [];

  constructor( public alertController: AlertController, 
               private http: HttpClient) { 
    this.cargaVarConfig();
    this.clienteAct = new Cliente(0,'ND','','','','ND','','',0,0,0,0,0,0,0,0);
  }

  cargaVarConfig(){
    if (localStorage.getItem('config')){
      this.varConfig = JSON.parse( localStorage.getItem('config'));
    } 
  }

  guardarVarConfig(){
    localStorage.setItem('config', JSON.stringify(this.varConfig));
  }

  getRutas(){
    return this.http.get<Ruta[]>( environment.rutasURL );
  }

  syncProductos(){
    const productos = DataProductos.slice(0);
    localStorage.removeItem('productos');
    localStorage.setItem('productos', JSON.stringify(productos));
  }

  cargarProductos(){
    if (localStorage.getItem('productos')){
      this.productos = JSON.parse( localStorage.getItem('productos'));
    }
  }

  syncClientes( ruta: string ){
    let cliente: Cliente;
    this.clientes = [];

    /* this.getClientes(ruta).subscribe(
      resp => {
        console.log('ClientesBD', resp );
        resp.forEach(e => {
          cliente = new Cliente(+e.COD_CLT, e.NOM_CLT, e.DIR_CLT, e.TIPO_CONTRIBUYENTE, e.CONTRIBUYENTE, e.RAZONSOCIAL, e.NUM_TEL,
            e.NOM_CTO, e.LIM_CRE, e.LIM_CRE, 15, e.LST_PRE, e.DESCUENTO, +e.TIPO_IMPUESTO, +e.TIPO_TARIFA, e.PORC_TARIFA)
          this.clientes.push( cliente );
        });
        console.log( 'Arreglo', this.clientes );
      }
    );*/

    const clientesBD = ClientesBD.slice(0);
    clientesBD.forEach(e => {
      cliente = new Cliente(+e.COD_CLT, e.NOM_CLT, e.DIR_CLT, e.TIPO_CONTRIBUYENTE, e.CONTRIBUYENTE, e.RAZONSOCIAL, e.NUM_TEL,
        e.NOM_CTO, e.LIM_CRE, e.LIM_CRE, 15, e.LST_PRE, e.DESCUENTO, +e.TIPO_IMPUESTO, +e.TIPO_TARIFA, e.PORC_TARIFA)
      this.clientes.push( cliente );
    });

    localStorage.removeItem('clientes');
    localStorage.setItem('clientes', JSON.stringify(this.clientes));
    this.cargarClientes();
  }

  getClientes(ruta: string){
    const query: string = environment.clientesURL + ruta;
    return this.http.get<ClienteBD[]>( query );
  }

  cargarClientes(){
    this.clientes = [];
    if (localStorage.getItem('clientes')){
      this.clientes = JSON.parse( localStorage.getItem('clientes'));
    }
  }

  async presentAlertW( subtitulo: string, mensaje: string ) {
    const alert = await this.alertController.create({
      header: 'Warning',
      subHeader: subtitulo,
      message: mensaje,
      buttons: ['OK']
    });

    await alert.present();
  }

  
}
