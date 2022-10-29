import { Component, OnInit } from '@angular/core';
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
export class Tab3DatosPage implements OnInit {

  version: string = '';
  ambiente: string = '';
  actualizar: boolean = true;
  darkMode: boolean = true;

  constructor( private navController: NavController,
               private alertCtrl: AlertController,
               private isa: IsaService,
               private isaPedidos: IsaPedidoService,
               private isaCobros: IsaCobrosService,
               private isaCardex: IsaCardexService ) { 

                                 // Actualiza la lista de rutas en ISA
  }

  ngOnInit(){
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    console.log(prefersDark);
    this.darkMode = prefersDark.matches;
    if (this.isa.varConfig.darkMode === undefined || this.isa.varConfig.darkMode === null) {
      this.isa.varConfig.darkMode = prefersDark.matches;
      this.isa.guardarVarConfig();
    } else {
      this.darkMode = this.isa.varConfig.darkMode;
    }

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
    );
  }

  cambioTheme(){
    console.log(this.darkMode);
    //this.darkMode = !this.darkMode;
    this.isa.varConfig.darkMode = this.darkMode;
    document.body.classList.toggle('dark', this.darkMode);
    this.isa.guardarVarConfig();
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

        // Si el consecutivo del servidor es mayor al del celular se cambia el consecutivo, sino se deja el del App

        if ( this.getConsecutivo(this.isa.rutas[i].pedido) > this.getConsecutivo(this.isa.varConfig.consecutivoPedidos) ){
          this.isa.varConfig.consecutivoPedidos = this.isa.rutas[i].pedido;
        }
        if ( this.getConsecutivo(this.isa.rutas[i].recibo) > this.getConsecutivo(this.isa.varConfig.consecutivoRecibos) ||
             this.isa.varConfig.consecutivoRecibos[4] !== 'R' ){
          this.isa.varConfig.consecutivoRecibos = this.isa.rutas[i].recibo;
        }
        this.isa.varConfig.consecutivoDevoluciones = this.isa.rutas[i].devolucion;
        this.isa.varConfig.emailCxC = this.isa.rutas[i].emaiL_EJECUTIVA;
        this.isa.varConfig.emailVendedor = this.isa.rutas[i].emaiL_VENDEDOR;
        this.isa.varConfig.emailSupervisor = this.isa.rutas[i].emaiL_SUPERVISOR;
        this.isa.varConfig.tipoCambio = this.isa.rutas[i].tcom;
        this.isa.varConfig.usaRecibos = this.isa.rutas[i].usA_RECIBOS === 'S' ? true : false;
        this.isa.varConfig.usaDevoluciones = this.isa.rutas[i].usA_DEVOLUCIONES === 'S' ? true : false;
        this.isa.varConfig.actualizado = this.isa.rutas[i].actualizado;
        this.isa.varConfig.borrarBD = this.isa.rutas[i].borraR_BD === 'S' ? true : false;
        this.isa.guardarVarConfig();
        if (this.isa.varConfig.actualizado === 'N'){
          this.actualizar = false;                    // rutas.actualizado === 'N' significa que no puede sincronizar la ruta.
        }
      } else {                                                      // Si ya había sincronizado no actualiza consecutivos
        this.isa.varConfig.nomVendedor = this.isa.rutas[i].agente;
        this.isa.varConfig.usuario = this.isa.rutas[i].ruta;
        this.isa.varConfig.clave = this.isa.rutas[i].handHeld;
        this.isa.varConfig.bodega = this.isa.rutas[i].bodega;
        this.isa.varConfig.emailCxC = this.isa.rutas[i].emaiL_EJECUTIVA;
        this.isa.varConfig.emailVendedor = this.isa.rutas[i].emaiL_VENDEDOR;
        this.isa.varConfig.emailSupervisor = this.isa.rutas[i].emaiL_SUPERVISOR;
        this.isa.varConfig.tipoCambio = this.isa.rutas[i].tcom;
        this.isa.varConfig.usaRecibos = this.isa.rutas[i].usA_RECIBOS === 'S' ? true : false;
        this.isa.varConfig.usaDevoluciones = this.isa.rutas[i].usA_DEVOLUCIONES === 'S' ? true : false;
        this.isa.varConfig.actualizado = this.isa.rutas[i].actualizado;
        this.isa.varConfig.borrarBD = this.isa.rutas[i].borraR_BD === 'S' ? true : false;
        this.isa.guardarVarConfig();
        if (this.isa.varConfig.actualizado === 'N'){
          this.actualizar = false;                    // rutas.actualizado === 'N' significa que no puede sincronizar la ruta.
        }
      }
    } else {
      this.actualizar = false;
    }
  }

  getConsecutivo( consecutivo: string ): number {
    return +consecutivo.slice(5);
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
    this.isa.syncCardex(this.isa.varConfig.numRuta);       // Carga la Info de la vista de Estadísticas de Ventas
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
