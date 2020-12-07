import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { Cardex } from 'src/app/models/cardex';
import { DataCardex } from 'src/app/models/data-cardex';
import { IsaCardexService } from 'src/app/services/isa-cardex.service';
import { IsaService } from 'src/app/services/isa.service';

@Component({
  selector: 'app-cardex',
  templateUrl: './cardex.page.html',
  styleUrls: ['./cardex.page.scss'],
})
export class CardexPage {
  codProducto: number;
  nomProducto: string;
  historico: Cardex[] = [];

  constructor( private activatedRoute: ActivatedRoute,
               public isa: IsaService,
               private navController: NavController,
               private alertController: AlertController,
               public isaCardex: IsaCardexService ) {

    this.activatedRoute.params.subscribe((data: any) => {    // Como parametro ingresa al modulo la info del cliente del rutero
      this.codProducto = data.codProducto;
      this.nomProducto = data.nombreProd
    });
    this.historico = DataCardex.slice(0);
  }

  regresar(){
    this.navController.back();
  }

  async guardarCardex(){
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Cardex',
        inputs: [
          {
            placeholder: 'Inventario',
            name: 'cantInventario',
            type: 'number',
            min: 0,
            max: 1000
          },
          {
            placeholder: 'Pedido',
            name: 'cantPedido',
            type: 'number',
            min: 0,
            max: 1000
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
            handler: (info) => {
              console.log('Confirm Ok');
              const data = new Cardex(this.isa.clienteAct.id, this.codProducto, info.cantInventario , info.cantPedido );
              this.isaCardex.agregarCardex(data);
              console.log(data);
              this.navController.back();
            }
          }
        ]
      });
  
      await alert.present();
    
  }

}
