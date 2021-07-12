import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { Ejecutivas, Recibo } from 'src/app/models/cobro';
import { IsaService } from 'src/app/services/isa.service';
import { ResumenRecPage } from '../resumen-rec/resumen-rec.page';

@Component({
  selector: 'app-liquida',
  templateUrl: './liquida.page.html',
  styleUrls: ['./liquida.page.scss'],
})
export class LiquidaPage implements OnInit {

  recibos: Recibo[] = [];
  montoEfectivo: number = 0;
  montoCheque: number = 0;
  ejecutiva: Ejecutivas = {
    empleado:         '',
    usuario:          '',
    clave:            '',
    email:            '',
    nombre:           '',
    email_Supervisor: ''
  };

  constructor( private navController: NavController,
               private modalCtrl: ModalController,
               private router: Router,
               private isa: IsaService ) { }

  ngOnInit() {
    if ( localStorage.getItem('recibos')){
      this.recibos = JSON.parse(localStorage.getItem('recibos'));
      this.recibos.forEach( d => {
        this.montoEfectivo += d.montoEfectivoL;
        this.montoCheque += d.montoChequeL;
      });
    }
  }

  async abrirDetalleRecibo( i: number ){
    const modal = await this.modalCtrl.create({
      component: ResumenRecPage,
      componentProps: {
        'recibo': this.recibos[i]
      },
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  liquidar(){
    if (this.recibos.length > 0){
      const i = this.recibos.findIndex( d => !d.envioExitoso );
      if ( i < 0 ){             // No hay recibos pendientes de transmitir
        this.router.navigate(['login',{
          usuario: 'CXC',
          navega: 'liquida-info'
        }]);
      } else {
        this.isa.presentAlertW( 'Liquidación', 'No se puede liquidar la ruta si hay recibos pendientes de transmitir.');
      }
    } else {
      this.isa.presentAlertW('Liquidación', 'No hay recibos para liquidar.');
    }
  }

  regresar(){
    this.navController.back();
  }

}
