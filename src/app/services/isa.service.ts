import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Bancos, BancosBD } from '../models/bancos';
import { Cardex, CardexBD, SugeridoBD } from '../models/cardex';
import { Cliente, ClienteBD, ClienteRT } from '../models/cliente';
import { CxCBD, Pen_Cobro } from '../models/cobro';
import { Exoneraciones, Existencias } from '../models/pedido';
import { Productos, ProductosBD } from '../models/productos';
import { Email } from '../models/email';
import { IsaLSService } from './isa-ls.service';
import { Bitacora } from '../models/bitacora';

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
  email: string;
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
  emaiL_EJECUTIVA: string;
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
    email: '',
  };

  clienteAct: Cliente;                          // Cliente Actual en el rutero
  nivelPrecios: string = '';
  rutas: Ruta[] = [];
  productos: Productos[] = [];                 // Variable Global con la lista de Productos disponibles para el cliente
  clientes: Cliente[] = [];                   // Variable Global con la lista de Clientes de la ruta
  exoneraciones: Exoneraciones[] = [];       // Variable Global con las exoneraciones de impuestos
  ids: string[] = [];
  existencias: Existencias[] = [];
  bitacora: Bitacora[] = [];
  userLogged: boolean = false;

  loading: HTMLIonLoadingElement;

  constructor( public alertController: AlertController, 
               private http: HttpClient,
               private loadingCtrl: LoadingController,
               private toastCtrl: ToastController,
               private isaLS: IsaLSService ) {

    this.cargarVarConfig();
    this.cargarExistencias();
    this.cargarBitacora();
    this.clienteAct = new Cliente('','ND','','','','ND','','',0,0,0,0,0,0,0,0,'','','','', null, null);
  }

  private cargarVarConfig(){
    if (localStorage.getItem('config')){
      this.varConfig = JSON.parse( localStorage.getItem('config'));
    } 
  }

  guardarVarConfig(){
    localStorage.setItem('config', JSON.stringify(this.varConfig));
  }

  private guardarBitacora(){
    localStorage.setItem( 'Bitacora', JSON.stringify(this.bitacora));
  }

  private cargarBitacora(){
    if (localStorage.getItem('Bitacora')){
      this.bitacora = JSON.parse( localStorage.getItem('Bitacora'));
    }
  }

  addBitacora( status: boolean, movimiento:string, linea: string ){
    const bitacora = new Bitacora( status, movimiento, linea);
    this.bitacora.unshift( bitacora );
    this.guardarBitacora();
  }

  getURL( api: string, id: string ){
    let test: string = '';
    if ( !environment.prdMode ) {
      test = environment.TestURL;
    }
    const URL = environment.preURL + test + environment.postURL + api + id;
    console.log(URL);
    return URL;
  }

  getRutas(){
    const URL = this.getURL( environment.rutasURL, '' );
    return this.http.get<Ruta[]>( URL );
  }

  private getClientes(ruta: string){
    const URL = this.getURL( environment.clientesURL, ruta );
    return this.http.get<ClienteBD[]>( URL );
  }

  private getProductos(ruta: string){
    const URL = this.getURL( environment.productosURL, ruta );
    return this.http.get<ProductosBD[]>( URL );
  }

  private getCardex( ruta: string ){
    const URL = this.getURL( environment.CardexURL, ruta );
    return this.http.get<CardexBD[]>( URL );
  }

  private getCxC( ruta: string ){
    const URL = this.getURL( environment.CxCURL, ruta );
    return this.http.get<CxCBD[]>( URL );
  }

  private getBancos(){
    const URL = this.getURL( environment.BancosURL, '' );
    return this.http.get<BancosBD[]>( URL );
  }

  private getExoneraciones(){
    const URL = this.getURL( environment.ExoneracionesURL, this.varConfig.numRuta );
    return this.http.get<Exoneraciones[]>( URL );
  }

  private getSugerido(){
    const URL = this.getURL( environment.SugeridoURL, this.varConfig.numRuta );
    return this.http.get<SugeridoBD[]>( URL );
  }

  private getExistencias(){
    const URL = this.getURL( environment.Existencias, '' );
    return this.http.get<Existencias[]>( URL );
  }

  syncExistencias(){
    let existencias: Existencias;
    let arr: Existencias[] = [];

    this.getExistencias().subscribe(
      resp => {
        console.log('Existencias', resp );
        arr = resp.slice(0);
        console.log('Arreglo', arr);
        this.isaLS.guardarExistencias( arr );
      }, error => {
        console.log(error.message);
        this.loadingDissmiss();
      }
    );
  }

  syncProductos( ruta: string ){
    let producto: Productos;
    this.productos = [];

    this.getProductos(ruta).subscribe(
      resp => {
        console.log('SKUBD', resp );
        resp.forEach(e => {
          producto = new Productos( e.articulo, e.des_Art, e.lst_Pre, e.nivel_Precio, e.precio, e.moneda, e.cod_Bar, e.impuesto, e.canasta_Basica, e.articulo+'.png', e.frio)
          this.productos.push( producto );
        });
        console.log( 'Arreglo', this.productos );
        if (localStorage.getItem('productos')){
          localStorage.removeItem('productos');
        }
        this.isaLS.guardarSKUS( this.productos );
        this.loadingDissmiss();
        this.presentaToast('Sincronización Finalizada.');
        // this.cargarProductos();
      }, error => {
        console.log(error.message);
      }
    );
  }

  /*cargarProductos(){
    if (localStorage.getItem('productos')){
      this.productos = JSON.parse( localStorage.getItem('productos'));
    }
  }*/

  async cargaListaPrecios(){
    let productos: Productos[];

    productos = await this.isaLS.getSKUS();
    this.productos = [];
    this.productos = productos.filter( p => p.listaPrecios == this.clienteAct.listaPrecios);
    if (this.productos.length !== 0){
      this.nivelPrecios = this.productos[0].nivelPrecio;
    } else {
      this.presentAlertW( 'Productos', 'El cliente no tiene cargada la lista de precios...');
      this.nivelPrecios = '';
    }
  }

  async cargarExistencias(){
    let existencias: Existencias[] = [];

    existencias = await this.isaLS.getExistencias();
    if (existencias){ 
      this.existencias = existencias.filter( d => d.bodega == this.varConfig.bodega.toString() );
      console.log(this.existencias);
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
            e.division_Geografica2, e.moroso, e.e_MAIL, e.latitud, e.longitud);
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
        this.isaLS.guardarHistVentas(cardexArr);
      }, error => {
        console.log(error.message);
        this.loadingDissmiss();
      }
    );
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

  syncExoneraciones(){
    let exoneracion: Exoneraciones;
    let exoneraciones: Exoneraciones[] = [];

    this.getExoneraciones().subscribe(
      resp => {
        console.log('Exoneraciones', resp );
        resp.forEach(e => {
          exoneracion = new Exoneraciones( e.cliente, e.codigO_ARTICULO, e.porcentaje, e.fechA_RIGE, e.fechA_VENCE );
          exoneraciones.push( exoneracion );
        });
        console.log( 'Arreglo', exoneraciones );
        if (localStorage.getItem('exoneraciones')){
          localStorage.removeItem('exoneraciones');
        }
        localStorage.setItem('exoneraciones', JSON.stringify(exoneraciones));
      }, error => {
        console.log(error.message);
      }
    );
  }

  cargarExoneraciones(){                           // Carga las exoneraciones que tenga vigentes un cliente en la variable global exoneraciones[]
    let exonerados: Exoneraciones[] = [];

    if (localStorage.getItem('exoneraciones')){
      exonerados = JSON.parse( localStorage.getItem('exoneraciones'));
    }
    if ( exonerados.length > 0 ){
      this.exoneraciones = exonerados.filter( d => d.cliente == this.clienteAct.id );
    } else {
      this.exoneraciones = [];
    }
  }

  syncSugerido(){
    let sugeridos: SugeridoBD[] = [];

    this.getSugerido().subscribe(
      resp => {
        console.log('Sugerido', resp );
        sugeridos = resp;
        if (localStorage.getItem('sugeridos')){
          localStorage.removeItem('sugeridos');
        }
        localStorage.setItem('sugeridos', JSON.stringify(sugeridos));
      }, error => {
        console.log(error.message);
      }
    );
  }

  consultarExoneracion( codCliente: string, codProducto: string ){
    if ( this.exoneraciones.length > 0 ){
      const exonera = this.exoneraciones.filter( d => d.codigO_ARTICULO == codProducto && d.cliente == codCliente );
      if ( exonera.length > 0 ){
        return exonera[0].porcentaje;
      } else {
        return 0;
      }
    } else {
      return 0;
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

  nextPedido(){
    let consec: number;
    let array: string;
    const consecutivo = this.varConfig.consecutivoPedidos;

    array = consecutivo[4];
    consec = +consecutivo.slice(5) + 1;
    for (let i = 0; i < 9 - consec.toString().length; i++) {
      array = array + '0';
    }
    this.varConfig.consecutivoPedidos = consecutivo.slice(0, 4) + array + consec.toString();
    this.guardarVarConfig();
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

  private postCoordenadas( cliente: ClienteRT ){
    const URL = this.getURL( environment.ClienteRTURL, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    return this.http.post( URL, JSON.stringify(cliente), options );
  }

  salvarCoordenadas(){
    let clienteRT: ClienteRT = {
      cliente : this.clienteAct.id,
      nombre : this.clienteAct.nombre,
      latitud : +this.clienteAct.latitud,
      longitud :+ this.clienteAct.longitud,
      altitud : null,
      fechA_ACTUALIZACION_UBICACION : new Date(),
      noteExistsFlag : 0,
      recordDate : new Date(),
      rowPointer : this.generate(),
      createdBy : 'ISA',
      updatedBy : 'ISA',
      createDate : new Date()
    }
    this.postCoordenadas( clienteRT ).subscribe(                    // Transmite el encabezado del pedido al Api
      resp => {
        console.log('Success GeoReferencia...', resp);
        this.presentaToast( 'GeoReferencia Actualizada...' );
      }, error => {
        console.log('Error GeoReferencia ', error);
        this.presentaToast( 'Error actualizando GeoReferencia...' );
      }
    );
  }

  private postEmail( email: Email ){
    const URL = this.getURL( environment.EmailURL, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    console.log(JSON.stringify(email));
    return this.http.post( URL, JSON.stringify(email), options );
  }

  enviarEmail( email: Email ){
    if ( this.validaEmail( email.toEmail )){
      this.postEmail( email ).subscribe(
        resp => {
          console.log('Email enviado', );
        }, error => {
          console.log('Error en el envío del Email');
          this.presentaToast('Error en el envío del Email');
        }
      );
    } else {
      this.presentaToast('El Cliente no posee Email válido.');
    }
    
  }

  validaEmail( direccion: string ){
    /*if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3,4})+$/.test(direccion)){
      return true;
     } else {
      return false;
     }*/
     return true;
  }

  
}
