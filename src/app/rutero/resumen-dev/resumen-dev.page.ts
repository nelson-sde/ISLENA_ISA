import { Component, Input, OnInit } from '@angular/core';
import { Devolucion } from '../../models/devolucion';
import { ModalController } from '@ionic/angular';
import { IsaDevService } from '../../services/isa-dev.service';
import { IsaService } from '../../services/isa.service';

@Component({
  selector: 'app-resumen-dev',
  templateUrl: './resumen-dev.page.html',
  styleUrls: ['./resumen-dev.page.scss'],
})
export class ResumenDevPage implements OnInit {

  @Input() devolucion: Devolucion;
  total: number = 0;

  constructor( private modalCtrl: ModalController,
               private isaDev: IsaDevService,
               private isa: IsaService ) { }

  ngOnInit() {
    this.total = this.devolucion.montoSinIVA - this.devolucion.montoDesc + this.devolucion.montoImp;
  }

  transmitirDev(){
    let devoluciones: Devolucion[] = [];

    if ( !this.devolucion.envioExitoso ) {
      devoluciones.push( this.devolucion );
      console.log('Retransmitiendo Devolución');
      this.isa.addBitacora( true, 'START', `Retransmite Devolución: ${this.devolucion.numDevolucion}`);
      this.isaDev.transmitirDev( devoluciones );
      this.regresar();
    } 
  }

  regresar(){
    this.modalCtrl.dismiss();
  }

}
