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
  cantInventario: number = 0;
  cantPedido: number = 0;
  i:          number;               // La posicion en el arreglo de Cardex donde esta el producto (-1 si no se halla)
  historico: Cardex[] = [];

  constructor( private activatedRoute: ActivatedRoute,
               public isa: IsaService,
               private navController: NavController,
               private alertController: AlertController,
               public isaCardex: IsaCardexService ) {

    this.activatedRoute.params.subscribe((data: any) => {    // Como parametro ingresa al modulo la info del cliente del rutero
      this.codProducto = data.codProducto;
      this.nomProducto = data.nombreProd;
      this.i = this.isaCardex.consultarProducto( this.codProducto );
      console.log(this.i);
      if ( this.i >= 0 ){
        this.cantPedido = this.isaCardex.cardex[this.i].cantPedido;
        this.cantInventario = this.isaCardex.cardex[this.i].cantInventario;
      }
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
            value: this.cantInventario,
            min: 0,
            max: 1000
          },
          {
            placeholder: 'Pedido',
            name: 'cantPedido',
            type: 'number',
            value: this.cantPedido,
            min: 0,
            max: 1000
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
          }, {
            text: 'Ok',
            handler: (info) => {
              if (this.i < 0){
                const data = new Cardex(this.isa.clienteAct.id, this.codProducto, this.nomProducto, +info.cantInventario , +info.cantPedido );
                this.isaCardex.agregarCardex(data);
                this.navController.back();
              } else {
                this.isaCardex.modificarCardex( this.i, info.cantPedido, info.cantInventario );
                this.navController.back();
              }
              
            }
          }
        ]
      });
  
      await alert.present();
    
  }

}
