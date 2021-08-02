import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, Platform, PopoverController } from '@ionic/angular';
import { Cliente } from 'src/app/models/cliente';
import { IsaService } from 'src/app/services/isa.service';
import { environment } from 'src/environments/environment';
import { ClienteInfoPage } from '../cliente-info/cliente-info.page';
import { ClientesPage } from '../clientes/clientes.page';
import { Plugins } from '@capacitor/core';
import { Rutero } from 'src/app/models/ruta';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NuevoPage } from 'src/app/configuracion/nuevo/nuevo.page';

const { App } = Plugins;

@Component({
  selector: 'app-rutero',
  templateUrl: './rutero.page.html',
  styleUrls: ['./rutero.page.scss'],
})
export class RuteroPage {
  texto: string = '';                          // Campo de busqueda del cliente
  direccion: string = '';                     // Direccion del cliente en el rutero
  dir: boolean = false;                      // Hay direccion = true
  codigoCliente: string = '';
  buscarClientes: Cliente[] = [];

  constructor( private alertController: AlertController,
               private router: Router,
               private isa: IsaService,
               private popoverCtrl: PopoverController,
               private modalCtrl: ModalController,
               private platform: Platform,
               private geolocation: Geolocation ) {

    this.isa.cargarClientes();
    this.cargarRutero();
    this.platform.backButton.subscribeWithPriority(10, () => {
      console.log('Handler was called!');
      this.presentAlertSalir();
    });
  }

  async clienteNuevo(){
    const modal = await this.modalCtrl.create({
      component: NuevoPage,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  abrirPedidos(){
    this.codigoCliente = this.isa.clienteAct.id;
    if (this.codigoCliente !== '' && this.texto.length !== 0){
      this.router.navigate(['/pedidos', {
                            codCliente: this.codigoCliente,
                            nombreCliente: this.texto,
                            dirCliente: this.direccion
      }]);
    } else {
      this.presentAlert('Pedidos', 'Debe seleccionar un cliente para ingresar un pedido.')
    }
  }

  abrirInventario(){
    this.codigoCliente = this.isa.clienteAct.id;
    if (this.codigoCliente !== '' && this.texto.length !== 0){
      this.router.navigate(['/inventario']);
    } else {
      this.presentAlert('Inventarios', 'Debe seleccionar un cliente para realizar un inventario.');
    }
  }

  abrirCobro(){
    this.codigoCliente = this.isa.clienteAct.id;
    if (this.codigoCliente !== '' && this.texto.length !== 0){
      this.router.navigate(['/pen-cobro']);
    } else {
      this.presentAlert('Cobros', 'Debe seleccionar un cliente para realizar un cobro.');
    }
  }

  abrirResumen(){
    this.router.navigate(['/resumen']);
  }

  abrirCuota(){
    this.router.navigate(['/cuota']);
  }

  abrirVisita(){
    this.router.navigate(['/visita']);
  }

  abrirLiquida(){
    this.router.navigate(['/liquida']);
  }

  buscarCliente( ev: any ){
    if ( this.isa.userLogged || !environment.prdMode ){            // Valida si el vendedor hizo login
      if (this.texto.length == 0) {                               // Se busca en todos los cliente
        this.buscarClientes = this.isa.clientes.slice(0);        // El modal se abrira con el arreglo completo de clientes
      } else if (this.texto[0] == '#'){
        this.buscarClientes = [];
        this.texto = this.texto.slice(1);
        const i = this.isa.clientes.findIndex( d => d.id == this.texto );
        if ( i >= 0 ){
          this.buscarClientes.push( this.isa.clientes[i]);
        }
      } else {
        this.buscarClientes = [];
        for (let i = 0; i < this.isa.clientes.length; i++) {
          if (this.isa.clientes[i].nombre.toLowerCase().indexOf( this.texto.toLowerCase(), 0 ) >= 0) {
            this.buscarClientes.push(this.isa.clientes[i]);
          }
        }
      }
      if (this.buscarClientes.length == 0){                               // no hay coincidencias
        this.presentAlert( this.texto, 'No hay coincidencias' );
        this.texto = '';
        this.direccion = '';
        this.dir = false;
        this.codigoCliente = '';
      } else if (this.buscarClientes.length == 1){                        // La coincidencia es exacta
        this.texto = this.buscarClientes[0].nombre;
        this.direccion = this.buscarClientes[0].direccion;
        this.codigoCliente = this.buscarClientes[0].id;
        this.dir = true;
        this.isa.clienteAct = this.buscarClientes[0];
        this.isa.cargaListaPrecios();
        this.isa.cargarExoneraciones();
        this.agregarRutero();
        if (this.isa.existencias.length === 0){
          this.isa.cargarExistencias();
        }
      } else {                                                           // Se debe abrir el modal para busqueda de clientes
        this.clientesPopover( ev );
      }
    } else {
      this.router.navigate(['login',{
        usuario: 'user',
        navega: 'root'
      }]);
    }
  }

  async clientesPopover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: ClientesPage,
      componentProps: {value: this.buscarClientes},
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    await popover.present();
    const {data} = await popover.onWillDismiss();
    if ( data !== undefined){
      if (data.codCliente == this.isa.clienteAct.id){
        this.codigoCliente = this.isa.clienteAct.id;
        this.texto = this.isa.clienteAct.nombre;
        this.direccion = this.isa.clienteAct.direccion;
        this.dir = true;
        this.isa.cargaListaPrecios();
        this.isa.cargarExoneraciones();
        this.agregarRutero();
        if (this.isa.existencias.length === 0){
          this.isa.cargarExistencias();
        }
      } else {
        this.codigoCliente = '';
        this.texto = '';
        this.direccion = '';
        this.dir = false;
      }
    }
  }

  async clienteInfoPopover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: ClienteInfoPage,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    await popover.present();
    const {data} = await popover.onWillDismiss();
    if ( data !== undefined){
      if ( data.modificado ){
        console.log('Se modificaron los datos del cliente');
        this.isa.actualizarCliente( this.isa.clienteAct.id, this.isa.clienteAct.nombreContacto, this.isa.clienteAct.telefonoContacto, this.isa.clienteAct.email );
      }
      if ( data.geoReferencia ){
        this.isa.salvarCoordenadas();
      }
    }
  }

  async presentAlert( subtitulo: string, mensaje: string ) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Lo siento...',
      subHeader: subtitulo,
      message: mensaje,
      buttons: ['OK']
    });

    await alert.present();
  }

  async presentAlertSalir() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Salir...',
      message: 'Desea salir de la aplicación?... Si hay datos pendientes se perderán.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Si',
          handler: () => {
            App.exitApp();
          }
        }
      ]
    });
    await alert.present();
  }

  cargarRutero(){
    if (localStorage.getItem('rutero')){
      this.isa.rutero = JSON.parse(localStorage.getItem('rutero'));
    }
  }

  agregarRutero(){
    const existe = this.isa.rutero.findIndex( d => d.cliente === this.isa.clienteAct.id);
    if (existe < 0){
      const item = new Rutero (this.isa.clienteAct.id, this.isa.varConfig.numRuta);
      if (this.isa.rutero.length > 0){
        if (this.isa.rutero[0].fin == null){
          this.isa.rutero[0].fin = new Date();
        }
      }
      this.isa.rutero.unshift(item);
      this.getGeo( item.cliente );
    }
  }

  getGeo( idCliente: string ){
    console.log('Cargando Geolocalización');
    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      console.log(resp);
      const existe = this.isa.rutero.findIndex( d => d.cliente === idCliente);
      if (existe >= 0){
        this.isa.rutero[existe].latitud = resp.coords.latitude;
        this.isa.rutero[existe].longitud = resp.coords.longitude;
        localStorage.setItem('rutero', JSON.stringify(this.isa.rutero));
      }
     }).catch((error) => {
       console.log('Error getting location', error);
       localStorage.setItem('rutero', JSON.stringify(this.isa.rutero));
     });
  }

}
