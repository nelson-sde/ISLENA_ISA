import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BackOrders } from 'src/app/models/pedido';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-backorders',
  templateUrl: './backorders.page.html',
  styleUrls: ['./backorders.page.scss'],
})
export class BackordersPage implements OnInit {

  @Input() arregloBO: BackOrders[]

  constructor( private modalCtrl: ModalController,
               public isa: IsaService ) { }

  ngOnInit() {
    console.log(this.arregloBO)
  }

  regresar(){
    this.modalCtrl.dismiss();
  }

}
