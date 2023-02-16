
import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController, PopoverController } from '@ionic/angular';
import { IsaService } from '../../services/isa.service';
import { IsaPedidoService } from '../../services/isa-pedido.service';
import { Tab3PopPage } from '../tab3-pop/tab3-pop.page';
import { IsaCobrosService } from '../../services/isa-cobros.service';
import { IsaCardexService } from '../../services/isa-cardex.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tab3-config',
  templateUrl: './tab3-config.page.html',
  styleUrls: ['./tab3-config.page.scss'],
})
 
export class Tab3ConfigPage implements OnInit{

  texto:string;
  ambiente: string = '';
  version: string = '';
  actualizado = true;
  loading: HTMLIonLoadingElement;

  constructor( private isa: IsaService,
               private isaPedidos: IsaPedidoService,
               private isaCobros: IsaCobrosService,
               private isaCardex: IsaCardexService,
               private alertCtrl: AlertController,
               private navControler: NavController,
               private popoverCtrl: PopoverController,
               private loadingCtrl: LoadingController ) {
  }

  ngOnInit(){
    if (environment.prdMode){
      this.ambiente = 'PRD';
    } else {
      this.ambiente = 'DEV';
    }
    this.version = environment.version;
    if (this.isa.rutas.length == 0) {
      //this.presentaLoading('Sincronizando Rutas...');
      this.isa.getRutas().subscribe(
        resp => {
          console.log('RutasBD', resp );
          this.isa.rutas = resp;
          if (this.isa.varConfig.numRuta !== 'R000'){
            const i = this.isa.rutas.findIndex( x => x.ruta === this.isa.varConfig.numRuta );
            if ( i >= 0){
              this.actualizarVarConfig(i);
            }
          }
          //this.loadingDissmiss();
          this.isa.presentaToast('Rutas cargadas...');
          console.log( 'Arreglo', this.isa.rutas );
        }, error => {
          this.actualizado = false;
          console.log(error.message);
          //this.loadingDissmiss();
          this.isa.presentAlertW('Cargando Rutas', error.message);
          this.isa.presentaToast('ERROR cargando Rutas...');
        }
      );                                // Actualiza la lista de rutas en ISA
    }
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

  async rutasPoppover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: Tab3PopPage,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    await popover.present();

    const {data} = await popover.onWillDismiss();
    console.log(data);
    if (data !== undefined) {
      this.actualizarVarConfig(data.indice);
    }
  }

  actualizarVarConfig( i: number ){      // indice de la ruta en el arreglo de rutas
    this.isa.varConfig.numRuta = this.isa.rutas[i].ruta;         // Asigna la nueva ruta a la varaible de entorno de ISA
    this.isa.varConfig.nomVendedor = this.isa.rutas[i].agente;
    this.isa.varConfig.usuario = this.isa.rutas[i].ruta;
    this.isa.varConfig.clave = this.isa.rutas[i].handHeld;
    this.isa.varConfig.bodega = this.isa.rutas[i].bodega;
    this.isa.varConfig.consecutivoPedidos = this.isa.rutas[i].pedido;
    this.isa.varConfig.consecutivoRecibos = this.isa.rutas[i].recibo;
    this.isa.varConfig.consecutivoDevoluciones = this.isa.rutas[i].devolucion;
    this.isa.varConfig.emailCxC = this.isa.rutas[i].emaiL_EJECUTIVA;
    this.isa.varConfig.emailVendedor = this.isa.rutas[i].emaiL_VENDEDOR;
    this.isa.varConfig.emailSupervisor = this.isa.rutas[i].emaiL_SUPERVISOR;
    this.isa.varConfig.tipoCambio = this.isa.rutas[i].tcom;
    this.isa.varConfig.actualizado = this.isa.rutas[i].actualizado;
    this.isa.varConfig.borrarBD = this.isa.rutas[i].borraR_BD === 'S' ? true : false;
    this.isa.varConfig.usaRecibos = this.isa.rutas[i].usA_RECIBOS === 'S' ? true : false;
    this.isa.varConfig.usaDevoluciones = this.isa.rutas[i].usA_DEVOLUCIONES === 'S' ? true : false;
    if (this.isa.varConfig.actualizado === 'N'){
      this.actualizado = false;
    }
    this.isa.guardarVarConfig();
  }

  rutaEnter( ruta: string ){
    this.rutasPoppover( null );
  }

  cargaConfig(){
    if ( this.isa.varConfig.numRuta.length > 0 &&
         this.isa.varConfig.usuario.length > 0 &&
         this.actualizado ) {
      this.isa.varConfig.ultimaLiquid = new Date();
      this.isa.guardarVarConfig();                              // Actualiza la informacion de entorno
      this.isa.syncInfo();
      this.isa.clienteAct.id = '';
      this.isa.syncClientes(this.isa.varConfig.numRuta);       // Carga la BD de Clientes de la ruta
      this.isa.syncProductos(this.isa.varConfig.numRuta);     // Actualiza la BD de productos
      this.isa.syncCardex(this.isa.varConfig.numRuta);
      this.isa.syncCxC(this.isa.varConfig.numRuta);
      this.isa.syncCuota( this.isa.varConfig.numRuta );
      this.isa.syncStockouts( this.isa.varConfig.numRuta );
      this.isa.syncBancos();
      this.isa.syncCantones();
      this.isa.syncRutasCanton();
      this.isa.syncDistritos();
      this.isa.syncRutasDist();
      this.isa.syncCategorias();
      this.isa.syncEjecutivas();
      this.isa.syncExoneraciones();
      this.isa.syncSugerido();
      this.isa.syncExistencias();
      this.isaPedidos.borrarPedidos( true );    // Se borra por completo la tabla pedidos
      this.isaCobros.borrarRecibos( true );
      this.isaCardex.borrarCardex();
      this.isa.borrarRutero();
      this.isa.borrarBitacora();
      this.regresar();
    } else {
      this.isa.presentAlertW(this.texto, 'Ruta Bloqueada... No se puede sincronizar...!!!');
    }
  }

  async presentAlertConfirm( i: number ) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Confirma',
      message: 'Cuidado <strong>Esta accion borrara toda la informacion de la ruta que no haya sincronizado</strong>!!!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Ok',
          handler: () => {
            this.actualizarVarConfig(i);
          }
        }
      ]
    });

    await alert.present();
  }

  regresar(){
    this.navControler.back();
    this.navControler.back();
  }
}
