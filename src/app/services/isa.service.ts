import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Bancos, BancosBD } from '../models/bancos';
import { Cardex, CardexBD, SugeridoBD, StockOuts } from '../models/cardex';
import { Categorias, Cliente, ClienteBD, ClienteNuevo, ClientePut, ClienteRT, RutasCanton } from '../models/cliente';
import { CxCBD, Ejecutivas, Pen_Cobro, RecEncaBD } from '../models/cobro';
import { Exoneraciones, Existencias, PedEnca, PedDeta, Entregas, PedidoWhatsappGet, BackOrders, PedidoWhatsappPut, Bonificaciones } from '../models/pedido';
import { Productos, ProductosBD } from '../models/productos';
import { Email } from '../models/email';
import { IsaLSService } from './isa-ls.service';
import { Bitacora } from '../models/bitacora';
import { Cantones, Cuota, Distritos, Ruta, RutaConfig, RutasDist, Rutero, UbicacionBD, VisitaBD, VisitaDiaria, VisitaDiariaNew } from '../models/ruta';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { SetupService } from './setup.service';

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
    consecutivoPedidos: 'RU00P000000000',
    consecutivoRecibos: 'RU00R000000000',
    consecutivoDevoluciones: '',
    bodega: 0,
    emailCxC: '',
    emailVendedor: '',
    usaRecibos: false,
    usuarioCxC: '',
    claveCxC: '',
    tipoCambio: environment.tipoCambio,
    ultimaLiquid: null,
    emailSupervisor: '',
    darkMode: null,
    actualizado: 'S',
    borrarBD: false,
    usaDevoluciones: false,
    usaBonis: false,
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
  userLogged: boolean = true;
  transmitiendo: string[] = [];
  rutero: Rutero[] = [];                // Arreglo con la lista de clientes visitados en el día
  hayPedidosWhatsapp: boolean = false;
  enSincronizar = false;               // Bandera que indica que se entró en el menú de sincronización

  loading: HTMLIonLoadingElement;

  constructor( public alertController: AlertController, 
               private http: HttpClient,
               private loadingCtrl: LoadingController,
               private toastCtrl: ToastController,
               private geoLocation: Geolocation,
               private isaLS: IsaLSService,
               private setup: SetupService ) {

    this.cargarVarConfig();
    this.cargarExistencias();
    this.cargarBitacora();
    this.clienteAct = new Cliente('','ND','','','','ND','','',0,0,0,0,0,0,0,0,'','','','', null, null, 'N', null);
  }

  private cargarVarConfig(){
    let ejecutivas: Ejecutivas[] = [];

    if (localStorage.getItem('config')){
      this.varConfig = JSON.parse( localStorage.getItem('config'));
      if ( this.varConfig.usuarioCxC === '' ){
        ejecutivas = JSON.parse( localStorage.getItem( 'ejecutivas')! ) || [];
        const i = ejecutivas.findIndex( d => d.email === this.varConfig.emailCxC );
        if ( i >= 0 ){
          this.varConfig.usuarioCxC = ejecutivas[i].usuario;
          this.varConfig.claveCxC = ejecutivas[i].clave;
          this.guardarVarConfig();
        }
      }
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

  borrarBitacora(){
    if (localStorage.getItem('Bitacora')){
      localStorage.removeItem('Bitacora');
    }
  }

  getURL( api: string, id: string ){
    let test: string = '';
    if ( !environment.prdMode ) {
      test = environment.TestURL;
    }
    const URL = this.setup.company.preURL1 + test + this.setup.company.postURL1 + api + id;
    console.log(URL);
    return URL;
  }

  private getIRPURL( api: string, id: string ){
    let test: string = '';
    //if ( !environment.prdMode ) {
      //test = environment.TestURL;
    //}
    const URL = this.setup.company.preURL2 + test + this.setup.company.postURL2 + api + id;
    console.log(URL);
    return URL;
  }

  private getCantones(){
    const URL = this.getIRPURL( environment.CantonesURL, '' );
    return this.http.get<Cantones[]>( URL );
  }

  private getRutasCantones(){
    const URL = this.getIRPURL( environment.rutasCantonURL, '' );
    return this.http.get<RutasCanton[]>( URL );
  }

  private getDistritos(){
    const URL = this.getIRPURL( environment.DistritosURL, '' );
    return this.http.get<Distritos[]>( URL );
  }

  getRutas(){
    const URL = this.getURL( environment.rutasURL, '' );
    return this.http.get<Ruta[]>( URL );
  }

  private getStockouts( ruta: string, fecha: string ){
    const URL = this.getURL( environment.StockOutsURL, `?fecha=${fecha}&ruta=${ruta}` );
    return this.http.get<StockOuts[]>( URL );
  }

  getPedido( numPedido: string ){
    const URL = this.getURL( environment.PedEncaURL, numPedido );
    return this.http.get<PedEnca[]>( URL );
  }

  getDetPedido( numPedido: string ){
    const URL = this.getURL( environment.PedDetaURL, numPedido );
    return this.http.get<PedDeta[]>( URL );
  }

  getRecibo( numRecibo: string ){
    const URL = this.getURL( environment.RecEncaURL, numRecibo );
    return this.http.get<RecEncaBD[]>( URL );
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
    const URL = this.getURL( environment.CardexURL, `?id=${ruta}` );
    return this.http.get<CardexBD[]>( URL );
  }

  private getCxC( ruta: string ){
    const URL = this.getURL( environment.CxCURL, ruta );
    return this.http.get<CxCBD[]>( URL );
  }

  private getCuota( ruta: string ){
    const URL = this.getURL( environment.CuotaURL, ruta );
    return this.http.get<Cuota[]>( URL );
  }

  private getBancos(){
    const URL = this.getURL( environment.BancosURL, '' );
    return this.http.get<BancosBD[]>( URL );
  }

  private getRutasDist(){
    const URL = this.getURL( environment.rutasDistURL, '' );
    return this.http.get<RutasDist[]>( URL );
  }

  private getCategorias(){
    const URL = this.getURL( environment.CategoriaClientesURL, '' );
    return this.http.get<Categorias[]>( URL );
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

  private getEjecutivas(){
    const URL = this.getURL( environment.Ejecutivas, '' );
    return this.http.get<Ejecutivas[]>( URL );
  }

  getEntregas( ruta: string ){
    const fecha = new Date;
    const URL = this.getURL( environment.EntregasURL, `?id=${ruta}&fecha=${this.getFecha(fecha, 'SQL')}` );
    return this.http.get<Entregas[]>( URL );
  }

  private getPedidosWhatsapp( ruta: string ){
    const URL = this.getURL( environment.PedWhatsGet, `?ruta=${ruta}` );
    return this.http.get<PedidoWhatsappGet[]>( URL );
  }

  private getBackOrders( ruta: string ){
    const fecha = new Date;
    const URL = this.getURL( environment.BackOrdersURL, `?id=${ruta}&fecha=${this.getFecha(fecha, 'SQL')}` );
    return this.http.get<BackOrders[]>( URL );
  }

  private getBonificaciones(ruta: string, fecha: string){
    const URL = this.getURL( environment.BoniURL, `?id=${ruta}&&fecha=${fecha}` );
    return this.http.get<Bonificaciones[]>( URL );
  }

  putPedidosWhatsapp( pedido: PedidoWhatsappPut ){
    const URL = this.getIRPURL( environment.PedWhatsAct, `?ID=${pedido.Pedido}&idCliente=${pedido.IdCliente}&linea=${pedido.linea}` );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*'
      }
    };
    console.log(JSON.stringify(pedido));
    return this.http.put( URL, JSON.stringify(pedido), options );
  }

  syncBackOrders( ruta: string ){
    this.getBackOrders( ruta ).subscribe(
      resp => {
        console.log('Back Orders', resp);
        localStorage.setItem('BackOrders', JSON.stringify(resp));
      }, error => {
        console.log('Error sincronizando Back Orders...!!!', error.message);
      }
    )
  }

  syncBonificaciones( ruta: string ){
    const fecha = this.getFecha(new Date(), 'SQL');

    this.getBonificaciones( ruta, fecha ).subscribe(
      resp => {
        console.log('Bonificaciones: ', resp);
        localStorage.setItem('Bonificaciones', JSON.stringify(resp));
      }, error => {
        console.log('Error sincronizando Bonificaciones...!!!', error.message);
      }
    )
  }

  syncPedidosWhatsapp( ruta: string ){
    this.getPedidosWhatsapp( ruta ).subscribe(
      resp => {
        console.log('Pedidos Whatsapp', resp);
        if (resp.length > 0){ 
          this.hayPedidosWhatsapp = true;
          localStorage.setItem('PedWhatsapp', JSON.stringify(resp));
        } else {
          this.hayPedidosWhatsapp = false;
        }
      }, error => {
        this.hayPedidosWhatsapp = false;
        console.log('Error sincronizando Pedidos de Whatsapp...!!!', error.message);
      }
    )
  }

  getFecha( fecha: Date, tipo?: string ){
    let day = new Date(fecha).getDate();
    let month = new Date(fecha).getMonth() + 1;
    let year = new Date(fecha).getFullYear();
    let dia: string = day.toString();
    let mes: string = month.toString();

    if ( month >= 0 && month <= 9 ) {
      mes = `0${month}`;
    }
    if ( day >= 0 && day <= 9 ){
      dia = `0${day}`;
    }

    if (tipo === 'JSON'){
        return `${year}-${mes}-${dia}T12:00`;
    } else if (tipo === 'SQL'){
      return `${year}-${mes}-${dia}`;
    } else {
      return `${dia}-${mes}-${year}`;
    }
  }

  syncStockouts(ruta: string){
    let fecha = new Date();

    if (environment.prdMode){ 
      fecha.setDate(fecha.getDate() - 6);
    } else {
      fecha = new Date('2022-07-01')
    }

    this.getStockouts( ruta,  this.getFecha(fecha, 'SQL') ).subscribe(
      resp => {
        console.log('Stockouts', resp);
        localStorage.setItem('StockOuts', JSON.stringify(resp));
      }, error => {
        console.log('Error sincronizando Stockouts...!!!', error.message);
      }
    )
  }

  syncEntregas( ruta: string ){
    this.getEntregas( ruta ).subscribe(
      resp => {
        console.log('Entregas', resp);
        localStorage.setItem('Entregas', JSON.stringify(resp));
      }, error => {
        console.log('Error sincronizando Stockouts...!!!', error.message);
      }
    )
  }

  syncRutasDist(){
    this.getRutasDist().subscribe(
      resp => {
        console.log('Rutas Dist', resp );
        localStorage.setItem('RutasDist', JSON.stringify(resp));
      }, error => {
        console.log(error.message);
      }
    );
  }

  syncCantones(){
    this.getCantones().subscribe(
      resp => {
        console.log('Cantones', resp );
        localStorage.setItem('Cantones', JSON.stringify(resp));
      }, error => {
        console.log(error.message);
      }
    );
  }

  syncRutasCanton(){
    this.getRutasCantones().subscribe(
      resp => {
        console.log('Rutas Cantón', resp );
        localStorage.setItem('RutasCanton', JSON.stringify(resp));
      }, error => {
        console.log(error.message);
      }
    );
  }

  syncDistritos(){
    this.getDistritos().subscribe(
      resp => {
        console.log('Distritos', resp );
        localStorage.setItem('Distritos', JSON.stringify(resp));
      }, error => {
        console.log(error.message);
      }
    );
  }

  syncExistencias(){
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

  async cargaListaPrecios(){
    let productos: Productos[];

    productos = await this.isaLS.getSKUS();
    this.productos = [];
    this.productos = productos.filter( p => p.listaPrecios == this.clienteAct.listaPrecios);
    if (this.productos.length !== 0){
      this.nivelPrecios = this.productos[0].nivelPrecio;
      console.log('Nivel de Precios:', this.nivelPrecios);
      console.log(this.productos);
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
            e.division_Geografica2, e.moroso, e.e_MAIL, e.latitud, e.longitud, e.usa_Letra, e.coD_CIA);
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
          cardex = new Cardex( e.cliente, e.factura, e.articulo, 'ND', letra, e.fecha, 0, e.cantidad, e.descuento, e.desC_TOT_LINEA, 
                      e.totaL_IMPUESTO1, e.preciO_TOTAL, e.preciO_UNITARIO, e.linea, e.bodega, e.desC_TOT_GENERAL);
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

  syncCuota( ruta: string ){
    let cuotaArray: Cuota[] = [];

    this.getCuota(ruta).subscribe(
      resp => {
        console.log('Cuota Ventas', resp );
        cuotaArray = resp.slice(0);
        console.log( 'Arreglo', cuotaArray );
        if (localStorage.getItem('cuota')){
          localStorage.removeItem('cuota');
        }
        localStorage.setItem('cuota', JSON.stringify(cuotaArray));
      }, error => {
        console.log(error.message);
      }
    );
  }

  cargarCuota(){
    let cuota: Cuota[] = [];

    if (localStorage.getItem('cuota')){
      cuota = JSON.parse( localStorage.getItem('cuota'));
    }
    return cuota;
  }

  syncBancos(){
    let banco: Bancos;
    let bancos: Bancos[] = [];

    this.getBancos().subscribe(
      resp => {
        console.log('Bancos', resp );
        resp.forEach(e => {
          banco = new Bancos(e.entidaD_FINANCIERA, e.descripcion, e.usA_TEF);
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

  syncCategorias(){
    this.getCategorias().subscribe(
      resp => {
        console.log('Categorias', resp );
        if (localStorage.getItem('categorias')){
          localStorage.removeItem('categorias');
        }
        localStorage.setItem('categorias', JSON.stringify(resp));
      }, error => {
        console.log(error.message);
      }
    );
  }

  cargarBancos( dep = false ){
    let bancos: Bancos[] = [];

    bancos = JSON.parse( localStorage.getItem('bancos')) ||  [];

    if (dep){
      return bancos.filter( x => x.usaTR == 'S' );
    } 
    
    return bancos;
  }

  syncEjecutivas(){
    this.getEjecutivas().subscribe(
      resp => {
        console.log('Ejecutivas', resp );
        if (localStorage.getItem('ejecutivas')){
          localStorage.removeItem('ejecutivas');
        }
        localStorage.setItem('ejecutivas', JSON.stringify(resp));
      }, error => {
        console.log(error.message);
      }
    );
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
      mode: 'ios',
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

    array = '';
    consec = +consecutivo.slice(10) + 1;
    for (let i = 0; i < 10 - consec.toString().length; i++) {
      array = array + '0';
    }
    return consecutivo.slice(0, 10) + array + consec.toString(); 
  }

  nextRecibo( consecutivo: string ){
    let consec: number;
    let array: string;

    array = consecutivo[4];
    consec = +consecutivo.slice(5) + 1;
    for (let i = 0; i < 9 - consec.toString().length; i++) {
      array = array + '0';
    }
    return consecutivo.slice(0, 4) + array + consec.toString(); 
  }

  incrementaConsec(tipo: string){
    // Tipo = 'R' (Recibo de Dinero)
    // Tipo = 'P' (Pedido)
    // Tipo = 'D' (Devolución)

    let tamEnca = 0;
    let tamConsec = 0;
    let consecutivo = '';
    let array = '';

    if (tipo === 'R'){
      tamEnca = this.setup.company.encaRecibos;
      tamConsec = this.setup.company.RecConsec;
      consecutivo = this.varConfig.consecutivoRecibos;
    } else if (tipo === 'P'){
      tamEnca = this.setup.company.encaPedidos;
      tamConsec = this.setup.company.PedConsec;
      consecutivo = this.varConfig.consecutivoPedidos;
    } else {
      tamEnca = this.setup.company.encaDev;
      tamConsec = this.setup.company.DevConsec;
      consecutivo = this.varConfig.consecutivoDevoluciones;
    }

    const nextConsec = +consecutivo.slice(tamEnca) + 1;
    for (let i = 0; i < tamConsec - nextConsec.toString().length; i++) {
      array = array + '0';
    }

    const nuevoConsec = consecutivo.slice(0, tamEnca) + array + nextConsec.toString(); 
    console.log('Nuevo consecutivo: ', nuevoConsec);

    if (tipo === 'R'){
      this.varConfig.consecutivoRecibos = nuevoConsec;
    } else if (tipo === 'P'){
      this.varConfig.consecutivoPedidos = nuevoConsec;
    } else {
      this.varConfig.consecutivoDevoluciones = nuevoConsec;
    }

    this.guardarVarConfig();

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

  public generate(): string {             // Función que genera de forma aleatoria un RowId
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

  private remove(id: string): void {
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

  private postClienteNuevo( cliente: ClienteNuevo ){
    const URL = this.getURL( environment.ClienteNuevoURL, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    console.log(JSON.stringify(cliente));
    return this.http.post( URL, JSON.stringify(cliente), options );
  }

  transmitirClienteNuevo( cliente: ClienteNuevo ){
    this.postClienteNuevo( cliente ).subscribe(
      resp => {
        console.log('Cliente nuevo insertado con exito.');
        this.presentaToast('Cliente Nuevo Transmitido.');
      }, error => {
        console.log('No se pudo transmitir el cliente nuevo');
        this.presentaToast('Error Transmitiendo Cliente Nuevo...');
      }
    )
  }

  private postSyncInfoNew( info: VisitaDiariaNew ){
    const URL = this.getURL( environment.SyncInfoNew, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    return this.http.post( URL, JSON.stringify(info), options );
  }

  private transmitirInfo( info: VisitaDiariaNew ){
    this.postSyncInfoNew( info ).subscribe(
      resp => {
        console.log('Success SyncInfo...', resp);
      }, error => {
        console.log('ERROR: guardando SyncInfo...!!! ', error);
      }
    )
  }

  private getID(){
    const fecha: Date = new Date();
    let day = new Date(fecha).getDate();
    let month = new Date(fecha).getMonth() + 1;
    let year = new Date(fecha).getFullYear();
    let dia: string = day.toString();
    let mes: string = month.toString();

    if ( month >= 0 && month <= 9 ) {
      mes = `0${month}`;
    }
    if ( day >= 0 && day <= 9 ){
      dia = `0${day}`;
    }
    return `${year}${mes}${dia}`
  }

  syncInfo(){
    const fecha = new Date();
    let info: VisitaDiariaNew = {
      ruta: this.varConfig.numRuta,
      horaSincroniza: new Date(fecha.getTime() - (fecha.getTimezoneOffset() * 60000)),
      latitud: null,
      longitud: null,
      Version: environment.version
    }

    this.geoLocation.getCurrentPosition().then((resp) => {
      info.latitud = resp.coords.latitude;
      info.longitud = resp.coords.longitude;
      this.transmitirInfo(info);
    }).catch((error) => {
      info.latitud = 0;
      info.longitud = 0;
      this.transmitirInfo(info);
      console.log('Error getting location', error);
    });
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

  private postCliente( cliente: ClientePut ){
    const URL = this.getURL( environment.ClientePutURL, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    return this.http.post( URL, JSON.stringify(cliente), options );
  }

  actualizarCliente( idCliente: string, contacto: string, telefono: string, email: string ){
    let cliente:  ClientePut = {
      RUTA:               this.varConfig.numRuta,
      FECHA_MODIFICACION: new Date(),
      CLIENTE:            idCliente,
      RUBRO1_CLIENTE :    email,
      RUBRO2_CLIENTE :    telefono,
      RUBRO3_CLIENTE :    contacto,
    }
    this.guardarClienteActual();
    this.postCliente( cliente ).subscribe(                    // Realiza la actualización de la tabla Islena.Cliente
      resp => {
        console.log('Cliente Actualizado...', resp);
        this.presentaToast( 'Cliente Actualizado...' );
      }, error => {
        console.log('Error Actualizando Cliente ', error.message);
        this.presentaToast( 'Error actualizando cliente...' );
      }
    );
  }

  guardarClienteActual(){                                                   // Actualiza los datos del Cliente en el Local Storage
    const i = this.clientes.findIndex( d => d.id === this.clienteAct.id );
    if ( i >= 0 ){
      this.clientes[i].email = this.clienteAct.email;
      this.clientes[i].telefonoContacto = this.clienteAct.telefonoContacto;
      this.clientes[i].nombreContacto = this.clienteAct.nombreContacto;
      localStorage.setItem('clientes', JSON.stringify(this.clientes));
    }
  }

  private postVisita( visitas: VisitaBD[] ){
    const URL = this.getURL( environment.VisitaURL, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    return this.http.post( URL, JSON.stringify(visitas), options );
  }

  borrarRutero(){
    if (localStorage.getItem('rutero')){
      localStorage.removeItem('rutero');
      this.rutero = [];
    }
  }

  actualizarVisitas(){
    let visitas: VisitaBD[] = [];
    let visita: VisitaBD;

    if (this.rutero.length > 0){
      if (this.rutero[0].fin === null){
        this.rutero[0].fin = new Date();
      }
      this.rutero.forEach( d => {
        visita = new VisitaBD(d.cliente, d.ruta, d.inicio, d.razon, d.fin, d.fecha_Plan, d.tipo, d.notas, null, d.latitud, d.longitud);
        visita.rowPointer = this.generate();
        visitas.push( visita );
      });

      this.postVisita( visitas ).subscribe(
        resp => {
          console.log('Sincronizando Visitas', resp);
          //this.actualizarVisitaUbicacion();             // La ubicación en la BD se insertará en un trigger After Insert de la tabla erpadmin.Visita
          this.rutero = [];
          localStorage.removeItem('rutero');
        }, error => {
          console.log('Error Sincronizando Visitas...!!!', error.message);
          console.log(JSON.stringify(visitas));
        }
      );
      console.log('Visitas JSON: ', JSON.stringify(visitas));
    }
  }

  private postUbicacion( visitas: UbicacionBD[] ){
    const URL = this.getURL( environment.UbicacionURL, '' );
    const options = {
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      }
    };
    return this.http.post( URL, JSON.stringify(visitas), options );
  }

  private actualizarVisitaUbicacion(){
    let visitas: UbicacionBD[] = [];
    let visita: UbicacionBD;

    if (this.rutero.length > 0){
      if (this.rutero[0].fin === null){
        this.rutero[0].fin = new Date();
      }
      this.rutero.forEach( d => {
        visita = new UbicacionBD( d.cliente, d.ruta, d.inicio, d.latitud, d.longitud, 0, d.inicio, d.inicio, 0, null);
        visita.rowPointer = this.generate();
        visitas.push( visita );
      });

      this.postUbicacion( visitas ).subscribe(
        resp => {
          console.log('Sincronizando Visitas Ubicación', resp);
          this.rutero = [];
          localStorage.removeItem('rutero');
        }, error => {
          console.log('Error Sincronizando Visitas Ubicación...!!!', error.message);
        }
      );
      console.log('Ubicacion JSON:', JSON.stringify(visitas));
    }
  }

  calculaImpuesto( texto: string, codProducto: string ){
    let impuesto: number;
    let exonerado: number = 0;

    switch ( texto ){
      case '0101':
        impuesto = 0;
        break;
      case '0102':
        impuesto = 0.01;
        break;
      case '0103':
        impuesto = 0.02;
        break;
      case '0104':
        impuesto = 0.04;
        break;
      case '0108':
        impuesto = 0.13;
        break;
      default:
        impuesto = 0;
        break;
    }
    console.log('impuesto', impuesto);
    console.log('exonerado', this.consultarExoneracion( this.clienteAct.id, codProducto ));
    exonerado = this.consultarExoneracion( this.clienteAct.id, codProducto )/100;
    impuesto -= exonerado;
    return impuesto < 0 ? 0 : impuesto;
  }
  
}
