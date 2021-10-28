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
import { Email } from 'src/app/models/email';

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
    const fecha = new Date();
    const day = new Date(fecha).getDate();
    const dayLiquid = new Date(this.isa.varConfig.ultimaLiquid).getDate();

    this.codigoCliente = this.isa.clienteAct.id;
    if (this.codigoCliente !== '' && this.texto.length !== 0){
      if ( day === dayLiquid ) { 
        this.router.navigate(['/pedidos', {
                              codCliente: this.codigoCliente,
                              nombreCliente: this.texto,
                              dirCliente: this.direccion
        }]);
      } else {
        this.presentAlert('Pedidos', 'No puede realizar pedidos sino ha sincronizado hoy...!!!');
      }
    } else {
      this.presentAlert('Pedidos', 'Debe seleccionar un cliente para ingresar un pedido.');
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
        this.isa.clienteAct = this.buscarClientes[0];
        this.cargarCliente();
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
        this.cargarCliente();
      } else {
        this.codigoCliente = '';
        this.texto = '';
        this.direccion = '';
        this.dir = false;
      }
    }
  }

  cargarCliente(){
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
    if ( this.isa.clienteAct.letraCambio ){
      const email = new Email( this.isa.varConfig.emailCxC, `Notificación: Letra de Cambio Cliente ${this.isa.clienteAct.id} - ${this.isa.varConfig.numRuta}`, 
        `Se reporta visita por parte del vendedor al cliente ${this.isa.clienteAct.id}, ${this.isa.clienteAct.nombre}, el cual tiene pendiente actualizar o firmar la letra de Cambio.`);
      this.isa.enviarEmail( email );
      this.isa.presentAlertW('Letra de Cambio', 'El Cliente tiene pendiente de firmar la letra de cambio.  Favor gestionar.');
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
          if ( this.isa.rutero[0].razon === 'N' ){ 
            this.cierraVisita(this.isa.rutero[0].cliente);
          }
        }
      }
      this.isa.rutero.unshift(item);
      this.getGeo( item.cliente );
    }
  }

  async cierraVisita( codCliente: string ){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Cierre Visita',
      inputs: [
        {
          name: 'radio1',
          type: 'radio',
          label: 'Baja Rotación',
          value: 'BAJA ROTACION',
          handler: () => {
            console.log('Radio 1 selected');
          },
          checked: true
        },
        {
          name: 'radio2',
          type: 'radio',
          label: 'Cliente no quiso Comprar',
          value: 'CLIENTE NO COMPRO',
          handler: () => {
            console.log('Radio 2 selected');
          }
        },
        {
          name: 'radio3',
          type: 'radio',
          label: 'Cliente sin Efectivo',
          value: 'CLIENTE SIN EFECTIVO',
          handler: () => {
            console.log('Radio 3 selected');
          }
        },
        {
          name: 'radio4',
          type: 'radio',
          label: 'Encargado Ausente',
          value: 'ENCARGADO AUSENTE',
          handler: () => {
            console.log('Radio 4 selected');
          }
        },
        {
          name: 'radio5',
          type: 'radio',
          label: 'Solo consulta',
          value: 'CONSULTA',
          handler: () => {
            console.log('Radio 5 selected');
          }
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            console.log('Confirm Ok', data);
            const i = this.isa.rutero.findIndex( d => d.cliente === codCliente );
            if ( i >= 0 ){
              this.isa.rutero[i].notas = data;
              localStorage.setItem('rutero', JSON.stringify(this.isa.rutero));
            }
          }
        }
      ]
    });

    await alert.present();
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
