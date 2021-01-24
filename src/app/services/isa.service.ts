import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Cliente, ClienteBD } from '../models/cliente';
import { Productos, ProductosBD } from '../models/productos';

export interface RutaConfig {
  numRuta: string;
  descripcion: string;
  codVendedor: number;
  nomVendedor: string;
  usuario: string;
  clave: string;
  consecutivoPedidos: string;
  consecutivoRecibos: string;
  consecutivoDevoluciones: string;
  bodega: number;
}

export interface Ruta {
  ruta: string;
  handHeld: string;
  grupo_Articulo: string;
  compania: string;
  bodega: number;
  agente: string;
  pedido: string;
  recibo: string;
  devolucion: string;
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
    consecutivoPedidos: '',
    consecutivoRecibos: '',
    consecutivoDevoluciones: '',
    bodega: 0,
  };

  clienteAct: Cliente;
  nivelPrecios: string = '';
  rutas: Ruta[] = [];
  productos: Productos[] = [];
  clientes: Cliente[] = [];
  buscarClientes: Cliente[] = [];
  ids: string[] = [];

  loading: HTMLIonLoadingElement;

  constructor( public alertController: AlertController, 
               private http: HttpClient,
               private loadingCtrl: LoadingController,
               private toastCtrl: ToastController) {

    this.cargaVarConfig();
    this.clienteAct = new Cliente(0,'ND','','','','ND','','',0,0,0,0,0,0,0,0,'','');
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
          producto = new Productos( +e.articulo, e.des_Art, e.lst_Pre, e.nivel_Precio, e.precio, e.moneda, e.cod_Bar, e.impuesto, e.canasta_Basica, e.articulo+'.png')
          this.productos.push( producto );
        });
        console.log( 'Arreglo', this.productos );
        if (localStorage.getItem('productos')){
          localStorage.removeItem('productos');
        }
        localStorage.setItem('productos', JSON.stringify(this.productos));
        this.cargarProductos();
        this.loading.dismiss();
        this.presentaToast('Sincronización Finalizada...');
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
    if (this.productos.length !== 0){
      this.nivelPrecios = this.productos[0].nivelPrecio;
    } else {
      this.presentAlertW( 'Productos', 'El cliente no tiene cargada la lista de precios...');
      this.nivelPrecios = '';
    }
  }

  syncClientes( ruta: string ){
    let cliente: Cliente;
    this.clientes = [];

    // this.presentaLoading('Sync Clientes...')
    this.getClientes(ruta).subscribe(
      resp => {
        console.log('ClientesBD', resp );
        resp.forEach(e => {
          cliente = new Cliente(+e.cod_Clt, e.nom_Clt, e.dir_Clt, e.tipo_Contribuyente, e.contribuyente, e.razonsocial, e.num_Tel,
            e.nom_Cto, e.lim_Cre, 0, +e.cod_Cnd, e.lst_Pre, e.descuento, +e.tipo_Impuesto, +e.tipo_Tarifa, e.porc_Tarifa, e.division_Geografica1, 
            e.division_Geografica2);
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

  nextConsecutivo( consecutivo: string ){
    let consec: number;
    let array: string = 'P';

    consec = +consecutivo.slice(5) + 1;
    for (let i = 0; i < 9 - consec.toString().length; i++) {
      array = array + '0';
    }
    return consecutivo.slice(0, 4) + array + consec.toString(); 
  }

  public generate(): string {
    let isUnique = false;
    let tempId = '';

    while (!isUnique) {
      tempId = this.generator();
      if (!this.idExists(tempId)) {
        isUnique = true;
        this.ids.push(tempId);
      }
    }

    return tempId;
  }

  public remove(id: string): void {
    const index = this.ids.indexOf(id);
    this.ids.splice(index, 1);
  }

  private generator(): string {
    const isString = `${this.S4()}${this.S4()}-${this.S4()}-${this.S4()}-${this.S4()}-${this.S4()}${this.S4()}${this.S4()}`;

    return isString;
  }

  private idExists(id: string): boolean {
    return this.ids.includes(id);
  }

  private S4(): string {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }

  async presentaToast ( message ){
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000
    });
    toast.present();
  }

  
}
