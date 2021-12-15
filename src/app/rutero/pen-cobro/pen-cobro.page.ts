import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, PopoverController } from '@ionic/angular';
import { Pen_Cobro } from 'src/app/models/cobro';
import { IsaCobrosService } from 'src/app/services/isa-cobros.service';
import { IsaService } from 'src/app/services/isa.service';
import { CobroInfoPage } from '../cobro-info/cobro-info.page';

@Component({
  selector: 'app-pen-cobro',
  templateUrl: './pen-cobro.page.html',
  styleUrls: ['./pen-cobro.page.scss'],
})
export class PenCobroPage {

  cxc: Pen_Cobro[] = [];
  saldo: number = 0;
  credito: string = '';

  constructor( private isa: IsaService,
               private isaCobro: IsaCobrosService,
               private navController: NavController,
               private router: Router,
               private popoverCtrl: PopoverController ) {

    // this.isaCobro.cargarCxC ( isa.clienteAct.id );
    this.cxc = isaCobro.cxc.slice(0);
    if ( this.cxc.length > 0 ){
      this.cxc.forEach( e => this.saldo += e.saldoLocal );
      this.credito = this.cxc[0].condicionPago;
    }
  }

  abrirRecibos(){
    if (this.isa.varConfig.usaRecibos) {
      this.router.navigate(['/recibos']);
    } else {
      this.isa.presentAlertW('Recibos Dinero', 'No tiene habilitada la opción de registrar recibos de Dinero.');
    }
  }

  async cobroInfoPopover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: CobroInfoPage,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    return await popover.present();
  }

  regresar(){
    this.navController.back();
  }

}
