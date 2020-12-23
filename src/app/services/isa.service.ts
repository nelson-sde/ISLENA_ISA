import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Cliente } from '../models/cliente';
import { DataClientes } from '../models/data-clientes';
import { DataProductos } from '../models/data-productos';
import { DataRutas } from '../models/Data-Rutas';
import { Productos } from '../models/productos';

interface Ruta {
  numRuta: string;
  descripcion: string;
  codVendedor: number;
  nomVendedor: string;
  usuario: string;
  clave: string;
  consecutivoPedidos: number;
  consecutivoRecibos: number;
}

@Injectable({
  providedIn: 'root'
})
export class IsaService {

  varConfig: Ruta = {
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
  ruta: Ruta;
  productos: Productos[] = [];
  clientes: Cliente[] = [];

  constructor(public alertController: AlertController) { 
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

  cargaRutas(){
    this.rutas = DataRutas.slice(0); 
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

  syncClientes(){
    const clientes = DataClientes.slice(0);
    localStorage.removeItem('clientes');
    localStorage.setItem('clientes', JSON.stringify(clientes));
  }

  cargarClientes(){
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
