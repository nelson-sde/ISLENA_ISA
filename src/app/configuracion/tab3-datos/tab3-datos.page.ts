import { Component } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { IsaCardexService } from 'src/app/services/isa-cardex.service';
import { IsaCobrosService } from 'src/app/services/isa-cobros.service';
import { IsaPedidoService } from 'src/app/services/isa-pedido.service';
import { IsaService } from 'src/app/services/isa.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tab3-datos',
  templateUrl: './tab3-datos.page.html',
  styleUrls: ['./tab3-datos.page.scss'],
})
export class Tab3DatosPage {

  version: string = '';
  ambiente: string = '';
  actualizar: boolean = false;

  constructor( private navController: NavController,
               private alertCtrl: AlertController,
               private isa: IsaService,
               private isaPedidos: IsaPedidoService,
               private isaCobros: IsaCobrosService,
               private isaCardex: IsaCardexService ) { 

    if (environment.prdMode){
      this.ambiente = 'PRD';
    } else {
      this.ambiente = 'DEV';
    }
    this.version = environment.version;
    const ruta = this.isa.varConfig.numRuta;
    this.isa.presentaLoading('Cargando Datos de Ruta...');
    this.isa.getRutas().subscribe(
      resp => {
        console.log('RutasBD', resp );
        this.isa.rutas = [];
        this.isa.rutas = resp;
        this.isa.loadingDissmiss();
        this.actualizaVarconfig( ruta );
        console.log( 'Arreglo', this.isa.rutas );
      }, error => {
        console.log(error.message);
        this.isa.loadingDissmiss();
        this.isa.presentAlertW('Cargando Rutas', error.message);
        this.actualizar = false;
      }
    );                                // Actualiza la lista de rutas en ISA
  }

  actualizaVarconfig( ruta: string ){
    const fecha = new Date();
    const day = new Date(fecha).getDate();
    const dayLiquid = new Date(this.isa.varConfig.ultimaLiquid).getDate();

    const i = this.isa.rutas.findIndex( d => d.ruta === ruta );
    if ( i >= 0 ){
      if ( day !== dayLiquid ){                                       // Si la ultima sincronización es diferente a hoy
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
        this.isa.varConfig.tipoCambio = this.isa.rutas[i].tcom;
        if ( this.isa.rutas[i].usA_RECIBOS === 'S') {
          this.isa.varConfig.usaRecibos = true;
        } else {
          this.isa.varConfig.usaRecibos = false;
        }
        this.isa.guardarVarConfig();
        this.actualizar = true;
      } else {                                                      // Si ya había sincronizado no actualiza consecutivos
        this.isa.varConfig.nomVendedor = this.isa.rutas[i].agente;
        this.isa.varConfig.usuario = this.isa.rutas[i].ruta;
        this.isa.varConfig.clave = this.isa.rutas[i].handHeld;
        this.isa.varConfig.bodega = this.isa.rutas[i].bodega;
        this.isa.varConfig.emailCxC = this.isa.rutas[i].emaiL_EJECUTIVA;
        this.isa.varConfig.emailVendedor = this.isa.rutas[i].emaiL_VENDEDOR;
        this.isa.varConfig.tipoCambio = this.isa.rutas[i].tcom;
        if ( this.isa.rutas[i].usA_RECIBOS === 'S') {
          this.isa.varConfig.usaRecibos = true;
        } else {
          this.isa.varConfig.usaRecibos = false;
        }
        this.isa.guardarVarConfig();
        this.actualizar = true;
      }
    }
  }

  async sincronizar(){
    if ( this.actualizar ){ 
      const alert = await this.alertCtrl.create({
        cssClass: 'my-custom-class',
        header: 'Confirmación',
        message: '<strong>Cuidado</strong> Esta accion borrara toda la informacion de la ruta que no haya transmitido!!!',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
          }, {
            text: 'Continúa',
            handler: () => {
              this.realizarSinc();
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.isa.presentAlertW('Carga de Datos', 'Error de Conexión...!!!');
    }
  }

  realizarSinc(){
    this.isa.varConfig.ultimaLiquid = new Date();
    this.isa.guardarVarConfig();
    this.isa.borrarBitacora();                                   // Se borra la bitácora de primero para que los movimientos generados en la Sync queden registrados.
    this.isaCobros.retransRecibosPen();                         // Este método retransmite los recibos pendientes hasta ahora.
    this.isa.actualizarVisitas();                              // Este procedimiento inserta las visitas y ubicaciones Visita y Visita_Ubicacion
    this.isa.syncInfo();                                      // Registra la ubicación e info de Sincronizacion
    this.isa.clienteAct.id = '';
    this.isa.syncClientes(this.isa.varConfig.numRuta);       // Carga la BD de Clientes de la ruta
    this.isa.syncProductos(this.isa.varConfig.numRuta);     // Actualiza la BD de productos
    this.isa.syncCardex(this.isa.varConfig.numRuta);
    this.isa.syncCxC(this.isa.varConfig.numRuta);
    this.isa.syncCuota( this.isa.varConfig.numRuta );
    this.isa.syncBancos();
    this.isa.syncCategorias();
    this.isa.syncEjecutivas();
    this.isa.syncExoneraciones();
    this.isa.syncSugerido();
    this.isa.syncExistencias();
    this.isaPedidos.borrarPedidos( false );   // False = Si hay pedidos sin transmitir no son borrados.
    // this.isaCobros.borrarRecibos( false );
    this.isaCardex.borrarCardex();
    
    this.regresar();
  }

  regresar(){
    this.navController.back();
  }

}
