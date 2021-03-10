import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Bancos, BancosBD } from '../models/bancos';
import { Cardex, CardexBD } from '../models/cardex';
import { Cliente, ClienteBD } from '../models/cliente';
import { CxCBD, Pen_Cobro } from '../models/cobro';
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

export interface Email {
  to: string;
  subject: string;
  body: string;
  isHtml: boolean;
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
    usuario: '',
    clave: '',
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
  ids: string[] = [];
  // historico: Cardex[] = [];
  userLogged: boolean = false;

  loading: HTMLIonLoadingElement;

  constructor( public alertController: AlertController, 
               private http: HttpClient,
               private loadingCtrl: LoadingController,
               private toastCtrl: ToastController ) {

    this.cargaVarConfig();
    this.clienteAct = new Cliente('','ND','','','','ND','','',0,0,0,0,0,0,0,0,'','','','');
  }

  private cargaVarConfig(){
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

  private getClientes(ruta: string){
    const query: string = environment.clientesURL + ruta;
    //const query: string = environment.clientesURL;
    return this.http.get<ClienteBD[]>( query );
  }

  private getProductos(ruta: string){
    const query: string = environment.productosURL + ruta;
    //const query: string = environment.clientesURL;
    return this.http.get<ProductosBD[]>( query );
  }

  private getCardex( ruta: string ){
    const query: string = environment.CardexURL + ruta;
    //const query: string = environment.clientesURL;
    return this.http.get<CardexBD[]>( query );
  }

  private getCxC( ruta: string ){
    const query: string = environment.CxCURL + ruta;
    //const query: string = environment.clientesURL;
    return this.http.get<CxCBD[]>( query );
  }

  private getBancos(){
    return this.http.get<BancosBD[]>(environment.BancosURL);
  }

  syncProductos( ruta: string ){
    let producto: Productos;
    this.productos = [];

    this.getProductos(ruta).subscribe(
      resp => {
        console.log('SKUBD', resp );
        resp.forEach(e => {
          producto = new Productos( e.articulo, e.des_Art, e.lst_Pre, e.nivel_Precio, e.precio, e.moneda, e.cod_Bar, e.impuesto, e.canasta_Basica, e.articulo+'.png')
          this.productos.push( producto );
        });
        console.log( 'Arreglo', this.productos );
        if (localStorage.getItem('productos')){
          localStorage.removeItem('productos');
        }
        localStorage.setItem('productos', JSON.stringify(this.productos));
        this.loadingDissmiss();
        this.presentaToast('Sincronización Finalizada.');
        this.cargarProductos();
      }, error => {
        console.log(error.message);
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

    this.presentaLoading('Sincronizando...');
    this.getClientes(ruta).subscribe(
      resp => {
        console.log('ClientesBD', resp );
        resp.forEach(e => {
          cliente = new Cliente(e.cod_Clt, e.nom_Clt, e.dir_Clt, e.tipo_Contribuyente, e.contribuyente, e.razonsocial, e.num_Tel,
            e.nom_Cto, 0, e.lim_Cre, +e.cod_Cnd, e.lst_Pre, e.descuento, +e.tipo_Impuesto, +e.tipo_Tarifa, e.porc_Tarifa, e.division_Geografica1, 
            e.division_Geografica2, e.moroso, e.e_MAIL);
          this.clientes.push( cliente );
        });
        console.log( 'Arreglo', this.clientes );
        if (localStorage.getItem('clientes')){
          localStorage.removeItem('clientes');
        }
        localStorage.setItem('clientes', JSON.stringify(this.clientes));
        this.cargarClientes();
      }, error => {
        console.log(error.message);
      }
    );
  }

  cargarClientes(){
    this.clientes = [];
    if (localStorage.getItem('clientes')){
      this.clientes = JSON.parse( localStorage.getItem('clientes'));
    }
  }

  modificarCliente( cliente: Cliente ){
    let clientes: Cliente[] = [];

    if (localStorage.getItem('clientesModificados')){
      clientes = JSON.parse( localStorage.getItem('clientesModificados'));
    }
    clientes.push( cliente );
    localStorage.setItem('clientesModificados', JSON.stringify(clientes));
    const i = this.clientes.findIndex( d => d.id == this.clienteAct.id );
    this.clientes[i] = this.clienteAct;
    localStorage.setItem('clientes', JSON.stringify(this.clientes));
  }

  syncCardex( ruta: string ){
    let j: number;
    let cardex: Cardex;
    let cardexArr: Cardex[] = [];
    let letra: string;

    this.getCardex( ruta ).subscribe(
      resp => {
        console.log('CardexBD', resp );
        resp.forEach(e => {
          letra = e.tipO_DOCUMENTO[0];
          cardex = new Cardex( e.cliente, e.articulo, 'ND', letra, e.fecha, 0, e.cantidad, e.descuento);
          cardexArr.push(cardex);
        });
        console.log('Arreglo', cardexArr);
        if (localStorage.getItem('cardex')){
          localStorage.removeItem('cardex');
        }
        localStorage.setItem('cardex', JSON.stringify(cardexArr));
      }, error => {
        console.log(error.message);
        this.loadingDissmiss();
      }
    );
  }

  cargarCardex( texto: string ){    // 'TODO' indica que se consultarán todos los productos del cliente.  Si TODO se sustituye por un código de producto, filtra por ITEM
    let cardex: Cardex[] = [];
    let cardex2: Cardex[] = [];
    let consulta: Cardex[] = [];
    let j: number;

    if (localStorage.getItem('cardex')){
      cardex = JSON.parse( localStorage.getItem('cardex'));
      if ( texto == 'TODO' ){ 
        cardex2 = cardex.filter(d => d.codCliente == this.clienteAct.id);
      } else {
        cardex2 = cardex.filter(d => d.codCliente == this.clienteAct.id && d.codProducto == texto );
      }
      if (cardex2.length > 0){
        for (let i = 0; i < cardex2.length; i++) {
          j = this.productos.findIndex(d => d.id == cardex2[i].codProducto);
          if (j >= 0){
            cardex2[i].desProducto = this.productos[j].nombre;
          }
        }
        consulta = cardex2.sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        return consulta;
      }
    }
  }

  syncCxC( ruta: string ){
    let cxc: Pen_Cobro;
    let cxcArray: Pen_Cobro[] = [];

    this.getCxC(ruta).subscribe(
      resp => {
        console.log('CXCBD', resp );
        resp.forEach(e => {
          cxc = new Pen_Cobro( ruta, e.coD_TIP_DC, e.nuM_DOC, e.coD_CLT, e.saldO_DOLAR, e.saldO_LOCAL, e.montO_DOLAR, e.montO_LOCAL,
                                new Date(e.feC_DOC_FT), new Date(e.feC_VEN), e.condicioN_PAGO);
          cxcArray.push( cxc );
        });
        console.log( 'Arreglo', cxcArray );
        if (localStorage.getItem('cxc')){
          localStorage.removeItem('cxc');
        }
        localStorage.setItem('cxc', JSON.stringify(cxcArray));
      }, error => {
        console.log(error.message);
      }
    );
  }

  syncBancos(){
    let banco: Bancos;
    let bancos: Bancos[] = [];

    this.getBancos().subscribe(
      resp => {
        console.log('Bancos', resp );
        resp.forEach(e => {
          banco = new Bancos(e.entidaD_FINANCIERA, e.descripcion);
          bancos.push( banco );
        });
        console.log( 'Arreglo', bancos );
        if (localStorage.getItem('bancos')){
          localStorage.removeItem('bancos');
        }
        localStorage.setItem('bancos', JSON.stringify(bancos));
      }, error => {
        console.log(error.message);
      }
    );
  }

  cargarBancos(){
    if (localStorage.getItem('bancos')){
      const bancos = JSON.parse( localStorage.getItem('bancos'));
      return bancos;
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

  async presentaLoading( mensaje: string ){
    this.loading = await this.loadingCtrl.create({
      message: mensaje,
    });
    await this.loading.present();
  }

  loadingDissmiss(){
    this.loading.dismiss();
  }

  nextConsecutivo( consecutivo: string ){
    let consec: number;
    let array: string;

    array = consecutivo[4];
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
      duration: 3500
    });
    toast.present();
  }

  
}
