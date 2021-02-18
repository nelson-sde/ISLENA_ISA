import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Pen_Cobro } from 'src/app/models/cobro';
import { IsaCobrosService } from 'src/app/services/isa-cobros.service';
import { IsaService } from 'src/app/services/isa.service';

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
               private router: Router ) {
    this.isaCobro.cargarCxC ( isa.clienteAct.id );
    this.cxc = isaCobro.cxc.slice(0);
    if ( this.cxc.length > 0 ){
      this.cxc.forEach( e => this.saldo = this.saldo + e.saldoLocal );
      this.credito = this.cxc[0].condicionPago;
    }
  }

  abrirRecibos(){
    this.router.navigate(['/recibos']);
  }

  regresar(){
    this.navController.back();
  }

}
