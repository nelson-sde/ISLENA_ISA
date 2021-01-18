import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Cliente, ClienteBD } from '../models/cliente';
import { DataProductos } from '../models/data-productos';
import { Productos, ProductosBD } from '../models/productos';

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
  Ruta: string;
  HandHeld: string;
  Grupo_Articulo: string;
  Compania: string;
  Bodega: number;
  Agente: string;
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

  loading: HTMLIonLoadingElement;

  constructor( public alertController: AlertController, 
               private http: HttpClient,
               private loadingCtrl: LoadingController) {

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

  syncProductos( ruta: string ){
    let producto: Productos;
    this.productos = [];

    this.presentaLoading('Sync Productos...')
    this.getProductos(ruta).subscribe(
      resp => {
        console.log('SKUBD', resp );
        resp.forEach(e => {
          producto = new Productos( +e.Articulo, e.Des_Art, e.Lst_Pre, e.Precio, e.moneda, e.Cod_Bar, e.Impuesto, e.Canasta_Basica, e.Articulo+'.png')
          this.productos.push( producto );
        });
        console.log( 'Arreglo', this.productos );
        if (localStorage.getItem('productos')){
          localStorage.removeItem('productos');
        }
        localStorage.setItem('productos', JSON.stringify(this.productos));
        this.cargarProductos();
        this.loading.dismiss();
      }, error => {
        console.log(error.message);
        this.loading.dismiss();
      }
    );
  }

  cargarProductos(){
    if (localStorage.getItem('productos')){
      this.productos = JSON.parse( localStorage.getItem('productos'));
    }
  }

  cargaListaPrecios(){
    let productos: Productos[];

    if (localStorage.getItem('productos')){
       productos = JSON.parse( localStorage.getItem('productos'));
    }
    this.productos = [];
    this.productos = productos.filter( p => p.listaPrecios == this.clienteAct.listaPrecios);
  }

  syncClientes( ruta: string ){
    let cliente: Cliente;
    this.clientes = [];

    // this.presentaLoading('Sync Clientes...')
    this.getClientes(ruta).subscribe(
      resp => {
        console.log('ClientesBD', resp );
        resp.forEach(e => {
          cliente = new Cliente(+e.Cod_Clt, e.Nom_Clt, e.Dir_Clt, e.Tipo_Contribuyente, e.Contribuyente, e.Razonsocial, e.Num_Tel,
            e.Nom_Cto, e.Lim_Cre, 0, +e.Cod_Cnd, e.Lst_Pre, e.Descuento, +e.Tipo_Impuesto, +e.Tipo_Tarifa, e.Porc_Tarifa)
          this.clientes.push( cliente );
        });
        console.log( 'Arreglo', this.clientes );
        if (localStorage.getItem('clientes')){
          localStorage.removeItem('clientes');
        }
        localStorage.setItem('clientes', JSON.stringify(this.clientes));
        this.cargarClientes();
        // this.loading.dismiss();
      }, error => {
        console.log(error.message);
        this.loading.dismiss();
      }
    );
  }

  getClientes(ruta: string){
    const query: string = environment.clientesURL + ruta;
    //const query: string = environment.clientesURL;
    return this.http.get<ClienteBD[]>( query );
  }

  cargarClientes(){
    this.clientes = [];
    if (localStorage.getItem('clientes')){
      this.clientes = JSON.parse( localStorage.getItem('clientes'));
    }
  }

  getProductos(ruta: string){
    const query: string = environment.productosURL + ruta;
    //const query: string = environment.clientesURL;
    return this.http.get<ProductosBD[]>( query );
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

  async presentaLoading( mensaje: string ){
    this.loading = await this.loadingCtrl.create({
      message: mensaje,
    });
    await this.loading.present();
  }

  
}
